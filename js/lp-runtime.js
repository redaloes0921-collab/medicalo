/* =========================================================
   LP Runtime — 랜딩 콘텐츠 적용 + 에디터(admin.html) 통신
   - 일반 방문: localStorage에 저장된 편집 내용을 적용만 함
   - ?edit=1 (admin iframe): 블록 스캔/선택/수정/이동/복제/삭제 지원
   ========================================================= */
(function () {
  'use strict';

  var KEY = 'medicalo_lp_state_v1';
  var EDIT = /[?&]edit=1/.test(location.search) || window.__LP_EDIT__ === true;
  var insertRef = document.currentScript; // 그룹 재삽입 기준점 (body 끝 script)
  var dupSeq = 0;

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- 상태 적용 (그룹 outerHTML 교체) ---------- */
  function applyState(st) {
    if (!st || !st.order || !st.groups) return;
    qsa('[data-lp-group]').forEach(function (e) { e.remove(); });
    st.order.forEach(function (gid) {
      var html = st.groups[gid];
      if (!html) return;
      var t = document.createElement('template');
      t.innerHTML = html.trim();
      var el = t.content.firstElementChild;
      if (el) insertRef.parentNode.insertBefore(el, insertRef);
    });
  }

  // 저장된 상태 자동 적용 (동일 오리진 localStorage)
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) applyState(saved);
  } catch (e) { /* noop */ }

  if (!EDIT) return;

  /* =========================================================
     이하 편집 모드 전용
     ========================================================= */

  // 편집 모드 스타일 (호버/선택 하이라이트, reveal 항상 표시)
  var style = document.createElement('style');
  style.id = 'lp-edit-style';
  style.textContent = [
    '.reveal{opacity:1!important;transform:none!important}',
    'html{scroll-behavior:auto}',
    '[data-lp]:hover{outline:1px dashed rgba(59,130,246,.7);outline-offset:2px;cursor:pointer}',
    '.lp-sel{outline:2px solid #3b82f6!important;outline-offset:3px;box-shadow:0 0 0 6px rgba(59,130,246,.15);border-radius:2px}'
  ].join('\n');
  document.head.appendChild(style);

  /* ---------- 필드 스캔 ---------- */
  var SEL = 'h1,h2,h3,h4,h5,p,li,figcaption,img,a,span.tag,span.prog-no,span.badge,span.was,span.now,div.num,div.lbl,div.n,.meta span';

  function isLeaf(el) {
    if (el.tagName === 'IMG') return true;
    return !el.querySelector(SEL);
  }

  function labelFor(el) {
    var c = el.classList;
    if (el.tagName === 'IMG') return '이미지';
    if (c.contains('tag')) return '태그';
    if (c.contains('prog-no')) return '스텝 라벨';
    if (c.contains('badge')) return '배지';
    if (c.contains('was')) return '기존가';
    if (c.contains('now')) return '할인가';
    if (c.contains('num')) return '수치';
    if (c.contains('lbl')) return '라벨';
    if (c.contains('n')) return '번호';
    if (c.contains('btn') || c.contains('nav-cta')) return '버튼';
    switch (el.tagName) {
      case 'H1': case 'H2': case 'H3': case 'H4': case 'H5': return '제목';
      case 'P': return '본문';
      case 'LI': return '항목';
      case 'A': return '링크';
      case 'FIGCAPTION': return '캡션';
      default: return '텍스트';
    }
  }

  var fidSeq = 0;
  function fieldsOf(block) {
    var els;
    if (block.tagName === 'IMG') {
      els = [block];
    } else {
      els = qsa(SEL, block).filter(isLeaf);
      if (!els.length) els = [block]; // 자체가 텍스트 블록
    }
    var counts = {};
    return els.map(function (el) {
      if (!el.dataset.fid) el.dataset.fid = 'f' + (++fidSeq);
      var base = labelFor(el);
      counts[base] = (counts[base] || 0) + 1;
      var label = base;
      if (els.filter(function (x) { return labelFor(x) === base; }).length > 1) label = base + ' ' + counts[base];
      if (el.tagName === 'IMG') {
        return { fid: el.dataset.fid, label: label, kind: 'image', value: el.getAttribute('src') || '' };
      }
      return { fid: el.dataset.fid, label: label, kind: 'html', value: el.innerHTML.trim() };
    });
  }

  function blockInfo(b) {
    var fields = fieldsOf(b);
    var type = (b.tagName === 'IMG') ? '이미지' : (fields.length > 1 ? '구성' : '텍스트');
    if (fields.length === 1 && fields[0].kind === 'image') type = '이미지';
    return { id: b.dataset.lp, label: b.dataset.lpLabel || '', type: type, fields: fields };
  }

  function tree() {
    return qsa('[data-lp-group]').map(function (g) {
      return {
        id: g.dataset.lpGroup,
        label: g.dataset.lpLabel || g.dataset.lpGroup,
        blocks: qsa('[data-lp]', g).map(blockInfo)
      };
    });
  }

  /* ---------- 선택/하이라이트 ---------- */
  function clearSel() { qsa('.lp-sel').forEach(function (e) { e.classList.remove('lp-sel'); }); }
  function select(id, isGroup) {
    clearSel();
    var el = isGroup ? qs('[data-lp-group="' + id + '"]') : qs('[data-lp="' + id + '"]');
    if (!el) return;
    el.classList.add('lp-sel');
    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { el.scrollIntoView(); }
  }

  // 미리보기에서 직접 클릭 → 에디터에 알림
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lp]');
    var g = b ? null : e.target.closest('[data-lp-group]');
    if (!b && !g) return;
    e.preventDefault();
    e.stopPropagation();
    if (b) { select(b.dataset.lp, false); send('picked', { id: b.dataset.lp, group: false }); }
    else { send('picked', { id: g.dataset.lpGroup, group: true }); }
  }, true);

  /* ---------- 편집 오퍼레이션 ---------- */
  function elOf(id, isGroup) {
    return isGroup ? qs('[data-lp-group="' + id + '"]') : qs('[data-lp="' + id + '"]');
  }
  function siblingBlock(el, dir, isGroup) {
    var attr = isGroup ? 'data-lp-group' : 'data-lp';
    var p = el;
    while ((p = dir < 0 ? p.previousElementSibling : p.nextElementSibling)) {
      if (p.hasAttribute(attr)) return p;
    }
    return null;
  }
  function renameIds(el) {
    var suffix = '-c' + (++dupSeq) + Date.now().toString(36).slice(-3);
    if (el.hasAttribute('data-lp-group')) el.setAttribute('data-lp-group', el.getAttribute('data-lp-group') + suffix);
    if (el.hasAttribute('data-lp')) el.setAttribute('data-lp', el.getAttribute('data-lp') + suffix);
    qsa('[data-lp]', el).forEach(function (c) { c.setAttribute('data-lp', c.getAttribute('data-lp') + suffix); });
    qsa('[data-fid]', el).forEach(function (c) { c.removeAttribute('data-fid'); });
    return el;
  }

  function doOp(action, id, isGroup) {
    var el = elOf(id, isGroup);
    if (!el) return;
    if (action === 'up' || action === 'down') {
      var sib = siblingBlock(el, action === 'up' ? -1 : 1, isGroup);
      if (!sib) return;
      if (action === 'up') sib.parentNode.insertBefore(el, sib);
      else sib.parentNode.insertBefore(el, sib.nextSibling);
      select(isGroup ? el.dataset.lpGroup : el.dataset.lp, isGroup);
    } else if (action === 'dup') {
      var clone = renameIds(el.cloneNode(true));
      clone.classList.remove('lp-sel');
      el.parentNode.insertBefore(clone, el.nextSibling);
      select(isGroup ? clone.dataset.lpGroup : clone.dataset.lp, isGroup);
    } else if (action === 'del') {
      el.remove();
    }
    send('tree', { tree: tree() });
  }

  function doUpdate(fid, kind, value) {
    var el = qs('[data-fid="' + fid + '"]');
    if (!el) return;
    if (kind === 'image') {
      el.setAttribute('src', value);
      el.style.display = '';
      el.style.opacity = '';
    } else {
      el.innerHTML = value;
    }
  }

  /* ---------- 상태 직렬화 ---------- */
  function cleanClone(g) {
    var c = g.cloneNode(true);
    c.classList.remove('lp-sel');
    qsa('.lp-sel', c).forEach(function (e) { e.classList.remove('lp-sel'); });
    return c;
  }
  function getState() {
    var order = [], groups = {};
    qsa('[data-lp-group]').forEach(function (g) {
      var id = g.dataset.lpGroup;
      order.push(id);
      groups[id] = cleanClone(g).outerHTML;
    });
    return { order: order, groups: groups, savedAt: new Date().toISOString() };
  }

  function exportHtml() {
    var doc = document.documentElement.cloneNode(true);
    var st = doc.querySelector('#lp-edit-style');
    if (st) st.remove();
    qsa('.lp-sel', doc).forEach(function (e) { e.classList.remove('lp-sel'); });
    return '<!DOCTYPE html>\n' + doc.outerHTML;
  }

  /* ---------- 에디터와 통신 ---------- */
  function send(type, payload) {
    var msg = Object.assign({ src: 'lp', type: type }, payload || {});
    window.parent.postMessage(msg, '*');
  }

  window.addEventListener('message', function (e) {
    var m = e.data;
    if (!m || typeof m.type !== 'string') return;
    switch (m.type) {
      case 'scan':    send('tree', { tree: tree() }); break;
      case 'select':  select(m.id, !!m.group); break;
      case 'update':  doUpdate(m.fid, m.kind, m.value); break;
      case 'op':      doOp(m.action, m.id, !!m.group); break;
      case 'restore': applyState(m.state); send('tree', { tree: tree() }); break;
      case 'state':   send('state', { state: getState() }); break;
      case 'export':  send('html', { html: exportHtml() }); break;
    }
  });

  send('ready', {});
})();
