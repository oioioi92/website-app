type WidgetRuntimeConfig = {
  /** default: current origin where widget is hosted */
  serverBaseUrl?: string;
  /** optional selector to attach; default document.body */
  mountSelector?: string;
  /** override button label */
  buttonText?: string;
};

function jsString(value: unknown) {
  return JSON.stringify(value ?? null);
}

export function getWidgetScript() {
  // Keep the widget standalone, no bundler required.
  // Uses `textContent` for rendering to avoid XSS.
  return `
(function(){
  if (window.__CHAT_WIDGET_LOADED__) return;
  window.__CHAT_WIDGET_LOADED__ = true;

  var DEFAULTS = ${jsString({
    serverBaseUrl: "",
    mountSelector: "",
    buttonText: "Chat"
  } satisfies WidgetRuntimeConfig)};

  function getConfig(){
    var cfg = window.ChatWidgetConfig || {};
    var out = {};
    for (var k in DEFAULTS) out[k] = DEFAULTS[k];
    for (var k2 in cfg) out[k2] = cfg[k2];
    return out;
  }

  function baseUrl(){
    var cfg = getConfig();
    if (cfg.serverBaseUrl && String(cfg.serverBaseUrl).trim()) return String(cfg.serverBaseUrl).trim();
    // default: same origin that served this script
    try { return new URL(document.currentScript && document.currentScript.src || location.href).origin; } catch(e) { return location.origin; }
  }

  function loadScript(src, cb){
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = function(){ cb && cb(null); };
    s.onerror = function(){ cb && cb(new Error('load_failed')); };
    document.head.appendChild(s);
  }

  function getSessionId(){
    var key = 'chat_session_id';
    try {
      var v = localStorage.getItem(key);
      if (v && v.length >= 6) return v;
      var bytes = new Uint8Array(16);
      if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
      else for (var i=0;i<bytes.length;i++) bytes[i] = Math.floor(Math.random()*256);
      var hex = Array.prototype.map.call(bytes, function(b){ return ('0'+b.toString(16)).slice(-2); }).join('');
      var sid = 'v_' + hex;
      localStorage.setItem(key, sid);
      return sid;
    } catch(e){
      return 'v_' + String(Math.random()).slice(2);
    }
  }

  function el(tag, className){
    var d = document.createElement(tag);
    if (className) d.className = className;
    return d;
  }

  function text(node, value){
    node.textContent = value == null ? '' : String(value);
  }

  function mountRoot(){
    var cfg = getConfig();
    if (cfg.mountSelector) {
      var n = document.querySelector(cfg.mountSelector);
      if (n) return n;
    }
    return document.body;
  }

  function injectStyle(){
    var css = ''
      + '.cw_btn{position:fixed;right:16px;bottom:16px;z-index:99999;width:56px;height:56px;border-radius:999px;border:1px solid rgba(245,158,11,.55);background:rgba(0,0,0,.65);color:#fcd34d;font-weight:800;cursor:pointer;backdrop-filter:blur(6px);box-shadow:0 10px 24px rgba(0,0,0,.55)}'
      + '.cw_panel{position:fixed;right:16px;bottom:84px;z-index:99999;width:320px;max-width:calc(100vw - 32px);height:420px;max-height:calc(100vh - 140px);border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(8,8,10,.92);color:#f5f5f5;display:none;overflow:hidden;box-shadow:0 18px 44px rgba(0,0,0,.6)}'
      + '.cw_head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(0,0,0,.35);border-bottom:1px solid rgba(255,255,255,.08)}'
      + '.cw_title{font-size:13px;font-weight:900;letter-spacing:.2px;color:#fcd34d}'
      + '.cw_close{border:0;background:transparent;color:#fff;opacity:.7;font-size:14px;cursor:pointer}'
      + '.cw_linkbtn{border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.25);color:#e5e7eb;border-radius:10px;padding:6px 8px;font-size:11px;font-weight:800;cursor:pointer}'
      + '.cw_msgs{padding:10px 12px;height:calc(100% - 98px);overflow:auto}'
      + '.cw_msg{margin-bottom:8px;padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.25)}'
      + '.cw_meta{display:flex;justify-content:space-between;font-size:10px;opacity:.65;margin-bottom:4px}'
      + '.cw_body{white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.35}'
      + '.cw_bar{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.25)}'
      + '.cw_in{flex:1;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.35);color:#fff;padding:8px 10px;font-size:13px;outline:none}'
      + '.cw_send{border-radius:10px;border:1px solid rgba(16,185,129,.45);background:rgba(16,185,129,.18);color:#d1fae5;font-weight:800;padding:8px 10px;cursor:pointer}'
      + '.cw_form{padding:10px 12px;height:calc(100% - 52px);overflow:auto}'
      + '.cw_field{margin-bottom:10px}'
      + '.cw_label{display:block;font-size:11px;opacity:.75;margin-bottom:6px}'
      + '.cw_text{width:100%;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.35);color:#fff;padding:8px 10px;font-size:13px;outline:none}'
      + '.cw_area{width:100%;min-height:120px;resize:vertical;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.35);color:#fff;padding:8px 10px;font-size:13px;outline:none}';
    var st = document.createElement('style');
    st.setAttribute('data-chat-widget-style', '1');
    st.appendChild(document.createTextNode(css));
    document.head.appendChild(st);
  }

  function start(){
    injectStyle();
    var cfg = getConfig();
    var root = mountRoot();
    var btn = el('button','cw_btn');
    text(btn, cfg.buttonText || 'Chat');
    var panel = el('div','cw_panel');
    var head = el('div','cw_head');
    var title = el('div','cw_title');
    text(title, 'Live Chat');
    var ticketBtn = el('button','cw_linkbtn');
    text(ticketBtn, '留言');
    var close = el('button','cw_close');
    text(close, 'X');
    var headRight = el('div','');
    headRight.style.display = 'flex';
    headRight.style.gap = '8px';
    headRight.appendChild(ticketBtn);
    headRight.appendChild(close);
    head.appendChild(title);
    head.appendChild(headRight);
    var msgs = el('div','cw_msgs');
    var bar = el('div','cw_bar');
    var input = el('input','cw_in');
    input.type = 'text';
    input.placeholder = 'Type message...';
    var sendBtn = el('button','cw_send');
    text(sendBtn, 'Send');
    bar.appendChild(input);
    bar.appendChild(sendBtn);
    panel.appendChild(head);
    panel.appendChild(msgs);
    panel.appendChild(bar);
    root.appendChild(btn);
    root.appendChild(panel);

    var mode = 'chat'; // chat | ticket

    function renderMode(nextMode){
      mode = nextMode;
      if (mode === 'chat') {
        msgs.style.display = 'block';
        bar.style.display = 'flex';
        if (ticketForm) ticketForm.style.display = 'none';
      } else {
        msgs.style.display = 'none';
        bar.style.display = 'none';
        if (ticketForm) ticketForm.style.display = 'block';
      }
    }

    function toggle(open){
      panel.style.display = open ? 'block' : 'none';
      if (open) input.focus();
    }
    btn.addEventListener('click', function(){ toggle(panel.style.display !== 'block'); });
    close.addEventListener('click', function(){ toggle(false); });
    ticketBtn.addEventListener('click', function(){
      toggle(true);
      renderMode('ticket');
    });

    var sessionId = getSessionId();
    var conversationId = null;
    var socket = null;

    // Ticket form (P1): visitor can leave offline message anytime.
    var ticketForm = el('div','cw_form');
    ticketForm.style.display = 'none';
    var f1 = el('div','cw_field');
    var l1 = el('label','cw_label'); text(l1,'联系方式（可选）');
    var contactIn = el('input','cw_text'); contactIn.type = 'text'; contactIn.placeholder = 'WhatsApp / Telegram / Email';
    f1.appendChild(l1); f1.appendChild(contactIn);
    var f2 = el('div','cw_field');
    var l2 = el('label','cw_label'); text(l2,'留言内容');
    var bodyArea = el('textarea','cw_area'); bodyArea.placeholder = '请输入留言...';
    f2.appendChild(l2); f2.appendChild(bodyArea);
    var f3 = el('div','cw_field');
    var submitBtn = el('button','cw_send'); text(submitBtn,'提交留言');
    f3.appendChild(submitBtn);
    ticketForm.appendChild(f1); ticketForm.appendChild(f2); ticketForm.appendChild(f3);
    panel.insertBefore(ticketForm, msgs);

    function postJson(url, payload, cb){
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('content-type','application/json');
        xhr.onreadystatechange = function(){
          if (xhr.readyState !== 4) return;
          if (xhr.status >= 200 && xhr.status < 300) cb && cb(null, xhr.responseText);
          else cb && cb(new Error('http_'+xhr.status));
        };
        xhr.send(JSON.stringify(payload));
      } catch(e) { cb && cb(e); }
    }

    submitBtn.addEventListener('click', function(){
      var body = (bodyArea.value || '').trim();
      var contact = (contactIn.value || '').trim();
      if (!body) { addMessage('system','请输入留言内容'); return; }
      submitBtn.disabled = true;
      postJson(baseUrl() + '/chat/api/public/tickets', { session_id: sessionId, contact: contact || null, body: body }, function(err){
        submitBtn.disabled = false;
        if (err) return addMessage('system', '提交失败，请稍后再试');
        bodyArea.value = '';
        contactIn.value = '';
        addMessage('system', '已收到留言，我们会尽快回复。');
        renderMode('chat');
      });
    });

    function addMessage(sender, body){
      var wrap = el('div','cw_msg');
      var meta = el('div','cw_meta');
      var left = el('span','');
      var right = el('span','');
      text(left, sender);
      text(right, new Date().toLocaleTimeString());
      meta.appendChild(left);
      meta.appendChild(right);
      var bodyEl = el('div','cw_body');
      text(bodyEl, body);
      wrap.appendChild(meta);
      wrap.appendChild(bodyEl);
      msgs.appendChild(wrap);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function connect(){
      if (!window.io) {
        addMessage('system', 'socket.io not loaded');
        return;
      }
      socket = window.io(baseUrl(), { path:'/ws-visitor', transports:['websocket'] });
      socket.on('connect', function(){
        socket.emit('visitor_hello', { sessionId: sessionId, entryUrl: location.href, referrer: document.referrer || null });
      });
      socket.on('conversation_open', function(p){
        conversationId = p && p.conversationId || null;
      });
      socket.on('message_new', function(m){
        if (!m) return;
        addMessage(m.senderType || 'unknown', m.bodyText || '');
      });
      socket.on('error', function(e){
        var msg = e && (e.error || e.message) ? (e.error || e.message) : 'error';
        addMessage('system', msg);
      });
    }

    function send(){
      var v = (input.value || '').trim();
      if (!v) return;
      input.value = '';
      if (!socket || !socket.connected) return addMessage('system', 'not connected');
      if (!conversationId) return addMessage('system', 'no conversation');
      socket.emit('visitor_message', { conversationId: conversationId, bodyText: v });
    }
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', function(e){ if (e.key === 'Enter') send(); });

    connect();
    renderMode('chat');
  }

  // Ensure socket.io client is available (served by chat-server, not a public CDN).
  if (!window.io) {
    loadScript(baseUrl() + '/chat/widget/socket.io.min.js', function(err){
      if (err) return;
      start();
    });
  } else {
    start();
  }
})();`;
}

