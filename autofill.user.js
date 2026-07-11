// ==UserScript==
// @name         中北大学教师评价自动填写
// @version     2.2.1
// @description 自动填写+自动提交+菜单直接选分
// @author      bbbbbb521
// @match       https://zhjw.nuc.edu.cn/*
// @icon        https://www.nuc.edu.cn/favicon.ico
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @grant       GM_notification
// @run-at      document-idle
// @license     MIT
// ==/UserScript==

(function() {
    'use strict';

    var SCORE = parseInt(GM_getValue('nuc_score', '100'));
    var lastSubmitTime = 0;
    var submitCooldown = 8000;

    function log(m) { console.log('[Eval] ' + m); }

    // === 菜单：直接选分 ===
    function setupMenu() {
        GM_registerMenuCommand('--- 选择分数 ---', function() {}, 's');

        var presets = [100, 95, 90, 85, 80, 75, 70, 60];
        presets.forEach(function(n) {
            var label = '  ' + n + '分';
            GM_registerMenuCommand(label, function() {
                SCORE = n;
                GM_setValue('nuc_score', '' + n);
                GM_notification({ text: '评分已设为 ' + n + ' 分', timeout: 1500 });
                // 刷新面板显示
                var ps = document.getElementById('nuc-score');
                if (ps) ps.textContent = n;
            });
        });

        GM_registerMenuCommand('自定义分数...', function() {
            var s = prompt('输入分数 (1-100)', SCORE);
            if (s) { var n = parseInt(s); if (n >= 1 && n <= 100) { SCORE = n; GM_setValue('nuc_score', '' + n); GM_notification({ text: '评分已设为 ' + n + ' 分', timeout: 1500 }); var ps = document.getElementById('nuc-score'); if (ps) ps.textContent = n; } }
        }, 'c');

        GM_registerMenuCommand('---', function() {}, 'sep');

        GM_registerMenuCommand('立即填写+提交', function() {
            fillAndSubmit();
            GM_notification({ text: '已执行', timeout: 1000 });
        }, 'f');
    }

    // === 浮动面板 ===
    function showPanel() {
        var d = document.createElement('div');
        d.id = 'nuc-panel';
        d.innerHTML =
            '<div style="position:fixed;top:10px;right:10px;z-index:99999;background:#1565C0;color:#fff;' +
            'border-radius:8px;padding:6px 12px;font-size:13px;font-family:Microsoft YaHei,sans-serif;' +
            'box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;gap:6px;cursor:pointer;">' +
            '<span id="nuc-st">\u23F3</span>' +
            '<span id="nuc-score" style="background:rgba(255,255,255,0.2);padding:1px 6px;border-radius:3px;">' + SCORE + '</span>' +
            '<span style="font-size:10px;color:rgba(255,255,255,0.6);">\u83dc\u5355\u9009\u5206</span>' +
            '</div>';
        document.body.appendChild(d);
    }

    function st(t) { var e = document.getElementById('nuc-st'); if (e) e.textContent = t; }

    function opt() {
        return SCORE > 80 ? '\u5b8c\u5168\u540c\u610f' : SCORE > 60 ? '\u540c\u610f' : SCORE > 40 ? '\u4e00\u822c' : SCORE > 20 ? '\u4e0d\u592a\u540c\u610f' : '\u5b8c\u5168\u4e0d\u540c\u610f';
    }

    // === 填写 ===
    function fillEmpty() {
        var n = 0;
        var q = document.querySelectorAll('input[type="text"],input[type="number"],input:not([type])');
        for (var i = 0; i < q.length; i++) {
            var e = q[i];
            if (e.readOnly || e.disabled || e.type === 'hidden' || e.type === 'radio' || e.type === 'checkbox' || e.type === 'submit' || e.type === 'button') continue;
            if (e.value !== undefined && e.value !== null && e.value.toString().trim() !== '') continue;
            e.value = '' + SCORE;
            e.dispatchEvent(new Event('input', { bubbles: true }));
            e.dispatchEvent(new Event('change', { bubbles: true }));
            n++;
        }
        var ta = document.querySelectorAll('textarea');
        for (var t = 0; t < ta.length; t++) {
            if (ta[t].readOnly || ta[t].disabled || ta[t].value.trim() !== '') continue;
            ta[t].value = '\u8001\u5e08\u6559\u5b66\u8ba4\u771f\u8d1f\u8d23\uff0c\u8bb2\u89e3\u6e05\u6670\u3002';
            ta[t].dispatchEvent(new Event('input', { bubbles: true }));
            n++;
        }
        var o = opt();
        var g = {};
        var rs = document.querySelectorAll('input[type="radio"]');
        for (var r = 0; r < rs.length; r++) {
            var rb = rs[r];
            if (!rb.name) continue;
            if (!g[rb.name]) g[rb.name] = [];
            g[rb.name].push(rb);
        }
        for (var k in g) {
            var gr = g[k];
            var ckd = false;
            for (var gi = 0; gi < gr.length; gi++) { if (gr[gi].checked) { ckd = true; break; } }
            if (ckd) continue;
            for (var gi = 0; gi < gr.length; gi++) {
                var r2 = gr[gi];
                var lb = r2.closest('label') || r2.parentElement;
                var tx = lb ? (lb.textContent || '').trim().replace(/\s+/g, '') : '';
                if (tx.indexOf(o) !== -1) {
                    r2.click();
                    r2.checked = true;
                    r2.dispatchEvent(new Event('change', { bubbles: true }));
                    n++;
                    break;
                }
            }
        }
        return n;
    }

    // === 提交 ===
    function trySubmit() {
        var now = Date.now();
        if (now - lastSubmitTime < submitCooldown) return false;
        var btns = document.querySelectorAll('button, input[type="submit"], input[type="button"], a.btn, a.button, a[class*="btn"], span[class*="btn"]');
        var keywords = ['\u63d0\u4ea4', '\u4fdd\u5b58', '\u786e\u5b9a', '\u786e\u8ba4', '\u4e0b\u4e00\u6b65'];
        for (var ki = 0; ki < keywords.length; ki++) {
            for (var bi = 0; bi < btns.length; bi++) {
                var txt = (btns[bi].textContent || btns[bi].value || '').trim();
                if (txt.indexOf(keywords[ki]) !== -1) {
                    lastSubmitTime = now;
                    log('\u70b9\u51fb: ' + txt);
                    btns[bi].click();
                    return true;
                }
            }
        }
        for (var bi = 0; bi < btns.length; bi++) {
            if (btns[bi].type === 'submit') {
                lastSubmitTime = now;
                log('\u70b9\u51fb submit');
                btns[bi].click();
                return true;
            }
        }
        return false;
    }

    // === 主流程 ===
    function fillAndSubmit() {
        var filled = fillEmpty();
        if (filled > 0) {
            st('\u2705' + filled);
            log('\u586b\u5199 ' + filled + ' \u9879');
        }
        var submitted = trySubmit();
        if (submitted) log('已提交');
    }

    // === 启动 ===
    function init() {
        try { showPanel(); } catch (e) {}
        try { setupMenu(); } catch (e) {}
        log('加载, 分数=' + SCORE);

        setInterval(function() { fillAndSubmit(); }, 2000);
        setTimeout(fillAndSubmit, 1500);
        setTimeout(fillAndSubmit, 4000);
        setTimeout(fillAndSubmit, 8000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();