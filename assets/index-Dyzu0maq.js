(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))u(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const c of t.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&u(c)}).observe(document,{childList:!0,subtree:!0});function i(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function u(e){if(e.ep)return;e.ep=!0;const t=i(e);fetch(e.href,t)}})();const a=100,g=150;function y(o,r){if(o<1||o>5)throw new Error("Superimpose value must be between 1 and 5.");return(14+o*2)*r*a}function E(o){return o?40*a:0}function I(o){if(o<0)throw new Error("Times Procced cannot be negative.");return 25*a*o}const v=document.getElementById("actions"),A=document.getElementById("vonwacq"),h=document.getElementById("eagle-times-procd"),w=document.getElementById("target-result"),q=document.querySelectorAll(".ddd-module"),L=document.getElementById("calculate"),m=document.getElementById("result"),P=document.getElementById("custom-aa");function B(){const o=parseFloat(v.value)||0,r=A.checked,i=parseFloat(w.value)||g,u=parseFloat(P.value)*a||0,e=Array.from(q).map(n=>{const d=n.querySelector(".superimpose"),p=n.querySelector(".times-procd"),s=parseFloat(d.value)||0,l=parseFloat(p.value)||0;return s>=1&&s<=5&&l>0?y(s,l):0}).filter(n=>n>0);let t=0;const c=parseFloat(h.value)||0;c>0&&(t=I(c));try{const n=E(r),d=e.reduce((l,f)=>l+f,0),s=(o*1e4-d-t-n-u)/i;m.textContent=s.toFixed(2)}catch(n){n instanceof Error?m.textContent="Error: "+n.message:m.textContent="An unknown error occurred"}}L.addEventListener("click",B);
