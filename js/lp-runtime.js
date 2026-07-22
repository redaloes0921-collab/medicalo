/* =========================================================
   LP Runtime — 랜딩 콘텐츠 적용 + 에디터(admin.html) 통신
   - 일반 방문: localStorage에 저장된 편집 내용을 적용만 함
   - ?edit=1 (admin iframe): 블록 스캔/선택/수정/이동/복제/삭제 지원
   ========================================================= */
(function () {
  'use strict';

  var KEY = 'medicalo_lp_state_v4';
  var EDIT = /[?&]edit=1/.test(location.search) || window.__LP_EDIT__ === true;
  var insertRef = document.currentScript; // 그룹 재삽입 기준점 (body 끝 script)
  var dupSeq = 0;

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- 상태 적용 (그룹 outerHTML 교체) ---------- */
  function applyState(st) {
    if (!st || !st.order || !st.groups) return;
    var groups = qsa('[data-lp-group]');
    // 그룹들의 실제 부모(.page 등) 안에서 교체한다
    var parent = groups.length ? groups[0].parentNode : (qs('.page') || insertRef.parentNode);
    var anchor = groups.length ? groups[groups.length - 1].nextSibling : (parent === insertRef.parentNode ? insertRef : null);
    groups.forEach(function (e) { e.remove(); });
    st.order.forEach(function (gid) {
      var html = st.groups[gid];
      if (!html) return;
      var t = document.createElement('template');
      t.innerHTML = html.trim();
      var el = t.content.firstElementChild;
      if (el) parent.insertBefore(el, anchor);
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
    '.lp-sel{outline:2px solid #3b82f6!important;outline-offset:3px;box-shadow:0 0 0 6px rgba(59,130,246,.15);border-radius:2px}',
    '[contenteditable]{cursor:text}',
    '[contenteditable]:hover{outline:1px dashed rgba(59,130,246,.7);outline-offset:2px}',
    '[contenteditable]:focus{outline:2px solid #3b82f6;outline-offset:3px;box-shadow:0 0 0 6px rgba(59,130,246,.12);border-radius:2px}',
    '#lp-drag-h{position:absolute;z-index:99999;width:28px;height:28px;border-radius:9px;background:#3b82f6;color:#fff;font-size:13px;display:none;align-items:center;justify-content:center;cursor:grab;user-select:none;box-shadow:0 2px 10px rgba(0,0,0,.3);letter-spacing:-2px}',
    '#lp-rad-h{position:absolute;z-index:99999;width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid #3b82f6;display:none;cursor:nwse-resize;box-shadow:0 1px 6px rgba(0,0,0,.35)}',
    '#lp-rad-lb{position:absolute;z-index:99999;background:#111;color:#fff;font-size:11.5px;padding:4px 10px;border-radius:6px;display:none;font-family:sans-serif;white-space:nowrap;pointer-events:none}',
    '.lp-dragging{opacity:.45!important;outline:2px dashed #3b82f6!important;outline-offset:2px}'
  ].join('\n');
  document.head.appendChild(style);

  /* ---------- 필드 스캔 ---------- */
  var SEL = 'h1,h2,h3,h4,h5,p,li,figcaption,summary,img,a,span.tag,span.prog-no,span.badge,span.was,span.now,div.num,div.lbl,div.n,.meta span';

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
    if (c.contains('btn') || c.contains('nav-cta') || c.contains('pill-btn') || c.contains('top-cta')) return '버튼';
    if (c.contains('ov')) return '오버라인';
    if (c.contains('nm')) return '이름/라벨';
    if (c.contains('meta')) return '메타 정보';
    if (c.contains('lb')) return '배너 라벨';
    if (c.contains('cap')) return '문구';
    if (c.contains('ans')) return '답변';
    if (el.tagName === 'SUMMARY') return '질문';
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
      // 미리보기에서 바로 수정할 수 있게 텍스트 요소는 contenteditable 처리
      if (el.tagName !== 'IMG' && !el.hasAttribute('contenteditable')) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
      }
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
    // 편집 모드에서는 아코디언(FAQ)을 모두 펼쳐 답변도 수정 가능하게
    qsa('details').forEach(function (d) { d.open = true; });
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

  // 미리보기에서 직접 클릭 → 에디터에 알림 (텍스트는 그대로 편집 진입)
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lp]');
    var g = b ? null : e.target.closest('[data-lp-group]');
    if (!b && !g) return;
    e.preventDefault(); // 링크 이동만 막고, 커서/포커스는 그대로 둔다
    if (b && !e.target.closest('[contenteditable]')) select(b.dataset.lp, false);
    if (b) { send('picked', { id: b.dataset.lp, group: false }); }
    else { send('picked', { id: g.dataset.lpGroup, group: true }); }
  }, true);

  // 인라인 편집: 입력 즉시 에디터에 동기화
  document.addEventListener('input', function (e) {
    var el = e.target.closest ? e.target.closest('[data-fid][contenteditable]') : null;
    if (!el) return;
    send('inline', { fid: el.dataset.fid, value: el.innerHTML.trim() });
  });
  // Enter 는 줄바꿈(<br>)으로 — 문단 div 삽입 방지
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var el = e.target.closest ? e.target.closest('[contenteditable]') : null;
    if (!el) return;
    e.preventDefault();
    document.execCommand('insertHTML', false, '<br>');
  });

  /* =========================================================
     드래그로 블록 이동 + 코너 라운드 핸들
     ========================================================= */
  var dragHandle = document.createElement('div');
  dragHandle.id = 'lp-drag-h'; dragHandle.textContent = '⠿'; dragHandle.title = '드래그해서 위치 이동';
  var radHandle = document.createElement('div');
  radHandle.id = 'lp-rad-h'; radHandle.title = '드래그해서 모서리 둥글기 조절';
  var radLabel = document.createElement('div');
  radLabel.id = 'lp-rad-lb';
  document.body.appendChild(dragHandle);
  document.body.appendChild(radHandle);
  document.body.appendChild(radLabel);

  var hoverBlock = null, dragging = null, radTarget = null, radDrag = null;

  function placeDrag(b) {
    if (!b || dragging) { if (!dragging) dragHandle.style.display = 'none'; return; }
    var r = b.getBoundingClientRect();
    dragHandle.style.display = 'flex';
    dragHandle.style.left = (r.left + window.scrollX - 10) + 'px';
    dragHandle.style.top = (r.top + window.scrollY - 10) + 'px';
  }
  function placeRad() {
    if (!radTarget || !radTarget.isConnected) { radHandle.style.display = 'none'; radLabel.style.display = 'none'; return; }
    var r = radTarget.getBoundingClientRect();
    radHandle.style.display = 'block';
    radHandle.style.left = (r.right + window.scrollX - 26) + 'px';
    radHandle.style.top = (r.top + window.scrollY + 8) + 'px';
  }

  document.addEventListener('mouseover', function (e) {
    if (dragging || radDrag) return;
    if (e.target === dragHandle || e.target === radHandle) return;
    var b = e.target.closest ? e.target.closest('[data-lp]') : null;
    if (b !== hoverBlock) { hoverBlock = b; placeDrag(b); }
  });
  window.addEventListener('scroll', function () { placeDrag(hoverBlock); placeRad(); }, true);
  window.addEventListener('resize', function () { placeDrag(hoverBlock); placeRad(); });

  // ---- 블록 드래그 이동 (같은 부모 안에서 순서 변경) ----
  dragHandle.addEventListener('pointerdown', function (e) {
    if (!hoverBlock) return;
    e.preventDefault();
    dragging = hoverBlock;
    dragging.classList.add('lp-dragging');
    dragHandle.setPointerCapture(e.pointerId);
    dragHandle.style.cursor = 'grabbing';
    dragHandle.style.pointerEvents = 'none'; // elementFromPoint 가 핸들에 걸리지 않게
  });
  dragHandle.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dragHandle.style.left = (e.pageX - 14) + 'px';
    dragHandle.style.top = (e.pageY - 14) + 'px';
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || !el.closest) return;
    var s = el.closest('[data-lp]');
    if (!s || s === dragging || s.parentNode !== dragging.parentNode) return;
    var cs = getComputedStyle(dragging.parentNode);
    var horiz = (cs.display.indexOf('flex') > -1 && cs.flexDirection.indexOf('column') === -1) ||
                (cs.display.indexOf('grid') > -1 && cs.gridTemplateColumns.split(' ').length > 1);
    var r = s.getBoundingClientRect();
    var before = horiz ? e.clientX < r.left + r.width / 2 : e.clientY < r.top + r.height / 2;
    dragging.parentNode.insertBefore(dragging, before ? s : s.nextSibling);
  });
  dragHandle.addEventListener('pointerup', function () {
    if (!dragging) return;
    dragging.classList.remove('lp-dragging');
    dragHandle.style.cursor = 'grab';
    dragHandle.style.pointerEvents = '';
    var moved = dragging; dragging = null;
    placeDrag(moved);
    send('tree', { tree: tree(), cause: 'drag' });
  });

  // ---- 코너 라운드 핸들 ----
  function pickRadTarget(e, block) {
    // 이미지 클릭 → 이미지, 텍스트 클릭 → 그 텍스트 요소, 그 외 → 블록
    var img = e.target.closest ? e.target.closest('img') : null;
    if (img && block && block.contains(img)) return img;
    var f = e.target.closest ? e.target.closest('[data-fid]') : null;
    if (f && block && block.contains(f)) return f;
    return block;
  }
  document.addEventListener('click', function (e) {
    if (e.target === dragHandle || e.target === radHandle) return;
    var b = e.target.closest ? e.target.closest('[data-lp]') : null;
    radTarget = b ? pickRadTarget(e, b) : null;
    placeRad();
  }, true);

  radHandle.addEventListener('pointerdown', function (e) {
    if (!radTarget) return;
    e.preventDefault(); e.stopPropagation();
    var r = radTarget.getBoundingClientRect();
    radDrag = {
      x: e.clientX, y: e.clientY,
      base: parseFloat((radTarget.style.borderRadius || '0').replace('%', '')) || 0,
      min: Math.max(40, Math.min(r.width, r.height))
    };
    radHandle.setPointerCapture(e.pointerId);
  });
  radHandle.addEventListener('pointermove', function (e) {
    if (!radDrag) return;
    var d = ((e.clientX - radDrag.x) + (e.clientY - radDrag.y)) / 2;
    var pct = Math.round(Math.max(0, Math.min(50, radDrag.base + (d / radDrag.min) * 100)));
    radTarget.style.borderRadius = pct ? pct + '%' : '';
    if (radTarget.tagName !== 'IMG' && radTarget.querySelector && radTarget.querySelector('img')) {
      radTarget.style.overflow = pct ? 'hidden' : '';
    }
    radLabel.textContent = '둥글기 ' + pct + '%';
    radLabel.style.display = 'block';
    radLabel.style.left = (e.pageX + 14) + 'px';
    radLabel.style.top = (e.pageY - 30) + 'px';
    placeRad();
  });
  radHandle.addEventListener('pointerup', function () {
    if (!radDrag) return;
    radDrag = null;
    radLabel.style.display = 'none';
    send('styled', {});
  });

  // ---- 이미지 라운드 일괄 적용 ----
  function radiusAll(v) {
    qsa('[data-lp-group] img').forEach(function (img) {
      img.style.borderRadius = v ? v + '%' : '';
    });
    send('styled', {});
  }

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
    c.classList.remove('lp-sel', 'lp-dragging');
    qsa('.lp-sel, .lp-dragging', c).forEach(function (e) { e.classList.remove('lp-sel', 'lp-dragging'); });
    qsa('[contenteditable]', c).forEach(function (e) {
      e.removeAttribute('contenteditable');
      e.removeAttribute('spellcheck');
    });
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
    qsa('[contenteditable]', doc).forEach(function (e) {
      e.removeAttribute('contenteditable');
      e.removeAttribute('spellcheck');
    });
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
      case 'restore': applyState(m.state); send('tree', { tree: tree(), cause: 'restore' }); break;
      case 'radiusAll': radiusAll(m.value); break;
      case 'state':   send('state', { state: getState(), tag: m.tag }); break;
      case 'export':  send('html', { html: exportHtml() }); break;
    }
  });

  send('ready', {});
})();
