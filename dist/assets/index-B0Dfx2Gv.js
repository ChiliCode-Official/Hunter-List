(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const c of document.querySelectorAll('link[rel="modulepreload"]'))o(c);new MutationObserver(c=>{for(const s of c)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(c){const s={};return c.integrity&&(s.integrity=c.integrity),c.referrerPolicy&&(s.referrerPolicy=c.referrerPolicy),c.crossOrigin==="use-credentials"?s.credentials="include":c.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(c){if(c.ep)return;c.ep=!0;const s=a(c);fetch(c.href,s)}})();const w={"Artículos de Tocador":{icon:"🪥",items:["Bálsamo Labios","Bloqueador","Cepillo Dientes","Crema Cabello","Crema Cara","Crema Cuerpo","Crema Ojos","Desodorante","Esponja","Espuma Afeitar","Hilo Dental","Jabón de Tocador","Loción","Pasta Dientes","Rastrillo","Shampoo","Toallitas Cara"]},Gadgets:{icon:"⚡",items:["Audífonos","Baterías","Bocina","Cámara Fotográfica","Cámara Video","Cargador Celular","Cargador iPad","Cargador iPod","Celulares","Convertidores de Energía","iPad","iPod","Lámpara","Pilas"]},Documentos:{icon:"📋",items:["Boleto Avión","Contrato Cacería","Efectivo","Licencia","Pasaporte","Permisos","Tarjeta de Crédito","Visa"]},Equipaje:{icon:"🎒",items:["Back Pack"]},"Equipo de Caza":{icon:"🎯",items:["Arco","Binoculares","Flecha","Rifle","Tapones","Tiros","Lentes"]},Ropa:{icon:"🧥",items:["Botas Caminar","Botas Nieve","Boxers","Bufanda","Calcetines","Calcetines Delgados","Calcetines Gruesos","Chamarra Aire","Chamarra Frío","Chamarra Nieve","Cinturón","Gorra","Gorro Frío","Guantes Aire","Guantes Frío","Pantalones Gruesos","Pantalones Ligeros","Pijama","Playera Manga Corta","Playera Manga Larga","Playeras","Rompe Vientos","Ropa Nieve","Ropa Térmica Gruesa","Ropa Térmica Ligera","Sudaderas","Warmers"]},Medicinas:{icon:"💊",items:["Antibióticos","Neosporín / Antiséptico","Avapena / Antihistamínico","Curitas / Heridas","Supradol / Dolor","Motrin Normal / Dolor y Fiebre","Motrin PM / Dolor y Fiebre","Tempra / Dolor y Fiebre","Gex Gel / Estómago","Omeprazol / Estómago","Omuro / Estómago","Pemix / Estómago","Pepto Bismol / Estómago","Sal de Uvas / Estómago","Treda / Estómago","Pastillas Fuegos","Pomada Fuegos","Pastillas Garganta","Pomada Hemorroides","Dolor Muscular"]},Varios:{icon:"🔥",items:["Encendedor","Puros"]}},P=[{id:"patos",name:"Patos",icon:"🦆",subtitle:"Cacería de Patos",color:"blue"},{id:"animales-grandes",name:"Animales Grandes",icon:"🦌",subtitle:"Caza Mayor",color:"green"}],D="hunterlist_v1";function R(){try{const t=localStorage.getItem(D);if(t){const e=JSON.parse(t);if(e.collections&&e.data)return e}}catch{}return H()}function H(){const t={};for(const e of P){t[e.id]={};for(const[a,o]of Object.entries(w))t[e.id][a]={icon:o.icon,collapsed:!0,items:o.items.map((c,s)=>({id:`${e.id}-${a}-${s}`,name:c,checked:!1}))}}return{collections:P,data:t,activeCollection:P[0].id}}function v(t){try{localStorage.setItem(D,JSON.stringify(t))}catch(e){console.warn("Could not save to localStorage:",e)}}let n=R(),d=null,m=null;const A=document.getElementById("collections-tabs"),p=document.getElementById("collection-view"),j=document.getElementById("header-stats"),_=document.getElementById("progress-fill"),V=document.getElementById("progress-label"),z=document.getElementById("progress-pct"),u=document.getElementById("modal-overlay"),k=document.getElementById("modal-input"),O=document.getElementById("modal-save"),J=document.getElementById("modal-delete"),U=document.getElementById("modal-close"),f=document.getElementById("add-modal-overlay"),b=document.getElementById("add-modal-input"),G=document.getElementById("add-modal-save"),K=document.getElementById("add-modal-cancel"),W=document.getElementById("add-modal-close");function Y(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36)}function $(t){let e=document.querySelector(".toast");e||(e=document.createElement("div"),e.className="toast",document.body.appendChild(e)),e.textContent=t,e.classList.add("show"),clearTimeout(e._timer),e._timer=setTimeout(()=>e.classList.remove("show"),2200)}function I(t){const e=n.data[t];if(!e)return{total:0,checked:0};let a=0,o=0;for(const c of Object.values(e))for(const s of c.items)a++,s.checked&&o++;return{total:a,checked:o}}function x(t,e){var s;const a=(s=n.data[t])==null?void 0:s[e];if(!a)return{total:0,checked:0};const o=a.items.length,c=a.items.filter(i=>i.checked).length;return{total:o,checked:c}}function F(t,e){const a=e>0?t/e:0,o=14,c=2*Math.PI*o,s=c*(1-a);return`
    <svg width="36" height="36" viewBox="0 0 36 36">
      <circle class="ring-bg"   cx="18" cy="18" r="${o}" />
      <circle class="ring-fill" cx="18" cy="18" r="${o}"
        stroke-dasharray="${c}"
        stroke-dashoffset="${s}"
      />
    </svg>
    <div class="ring-text">${Math.round(a*100)}%</div>
  `}function T(){A.innerHTML="";for(const t of n.collections){const e=I(t.id),a=document.createElement("button");a.className="tab-btn"+(t.id===n.activeCollection?" active":""),a.dataset.colId=t.id,a.innerHTML=`
      <span>${t.icon}</span>
      <span>${t.name}</span>
      <span class="tab-badge">${e.checked}/${e.total}</span>
    `,a.addEventListener("click",()=>{n.activeCollection=t.id,v(n),T(),C(),h()}),A.appendChild(a)}}function Q(){let t=0,e=0;for(const a of n.collections){const o=I(a.id);t+=o.total,e+=o.checked}j.innerHTML=`
    <div class="stat-pill">🎯 ${e} / ${t} Total</div>
  `}function h(){const{total:t,checked:e}=I(n.activeCollection),a=t>0?Math.round(e/t*100):0;_.style.width=a+"%",V.textContent=`${e} / ${t} Items`,z.textContent=a+"%",Q(),T()}function C(){const t=n.activeCollection,e=n.collections.find(i=>i.id===t),a=n.data[t];if(!a||!e){p.innerHTML='<div class="empty-state"><div class="empty-icon">🎯</div><p>No hay colección activa.</p></div>';return}const{total:o,checked:c}=I(t);let s=`
    <div class="collection-header">
      <div class="collection-title-block">
        <span class="collection-icon">${e.icon}</span>
        <div>
          <div class="collection-title">${e.name}</div>
          <div class="collection-subtitle">${e.subtitle} · ${c} de ${o} listos</div>
        </div>
      </div>
      <button class="btn-reset-collection" data-col-id="${t}" title="Resetear esta colección">
        ↺ Resetear
      </button>
    </div>
    <div class="categories-grid">
  `;for(const[i,y]of Object.entries(a)){const l=x(t,i),E=y.collapsed?"collapsed":"";s+=`
      <div class="category-card ${E}" data-col="${t}" data-cat="${i}">
        <div class="category-card-header" data-toggle-cat="${i}">
          <div class="category-name-block">
            <span class="category-icon">${y.icon}</span>
            <div>
              <div class="category-name">${i}</div>
              <div class="category-count">${l.checked} / ${l.total}</div>
            </div>
          </div>
          <div class="category-header-right">
            <div class="category-progress-ring">
              ${F(l.checked,l.total)}
            </div>
            <span class="category-chevron">▾</span>
          </div>
        </div>
        <ul class="category-items-list">
    `;for(const g of y.items){const S=g.checked?"checked":"";s+=`
        <li class="item-row ${S}" 
            data-col="${t}" data-cat="${i}" data-item-id="${g.id}"
            tabindex="0" role="checkbox" aria-checked="${g.checked}">
          <div class="item-checkbox-wrap">
            <span class="checkmark">✓</span>
          </div>
          <span class="item-label">${X(g.name)}</span>
          <button class="item-edit-btn" 
                  data-edit-col="${t}" 
                  data-edit-cat="${i}" 
                  data-edit-item="${g.id}"
                  title="Editar">✎</button>
        </li>
      `}s+=`
        </ul>
        <button class="add-item-btn" 
                data-add-col="${t}" 
                data-add-cat="${i}">
          <span class="plus-icon">+</span>
          Añadir elemento
        </button>
      </div>
    `}s+="</div>",p.innerHTML=s,Z()}function X(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Z(){var t;p.querySelectorAll("[data-toggle-cat]").forEach(e=>{e.addEventListener("click",()=>{const a=e.closest(".category-card"),o=a.dataset.col,c=a.dataset.cat;n.data[o][c].collapsed=!n.data[o][c].collapsed,a.classList.toggle("collapsed"),v(n)})}),p.querySelectorAll(".item-row").forEach(e=>{const a=o=>{if(o.target.closest(".item-edit-btn"))return;const c=e.dataset.col,s=e.dataset.cat,i=e.dataset.itemId,l=n.data[c][s].items.find(q=>q.id===i);if(!l)return;l.checked=!l.checked,e.classList.toggle("checked",l.checked),e.setAttribute("aria-checked",l.checked),v(n),h();const E=e.closest(".category-card"),g=E.dataset.col,S=E.dataset.cat,L=x(g,S),B=E.querySelector(".category-progress-ring");B&&(B.innerHTML=F(L.checked,L.total));const M=E.querySelector(".category-count");M&&(M.textContent=`${L.checked} / ${L.total}`)};e.addEventListener("click",a),e.addEventListener("keydown",o=>{(o.key===" "||o.key==="Enter")&&(o.preventDefault(),a(o))})}),p.querySelectorAll(".item-edit-btn").forEach(e=>{e.addEventListener("click",a=>{a.stopPropagation();const o=e.dataset.editCol,c=e.dataset.editCat,s=e.dataset.editItem,i=n.data[o][c].items.find(y=>y.id===s);i&&(d={colId:o,catName:c,itemId:s},k.value=i.name,N(u),k.focus(),k.select())})}),p.querySelectorAll(".add-item-btn").forEach(e=>{e.addEventListener("click",()=>{m={colId:e.dataset.addCol,catName:e.dataset.addCat},b.value="",N(f),b.focus()})}),(t=p.querySelector(".btn-reset-collection"))==null||t.addEventListener("click",e=>{const a=e.currentTarget.dataset.colId;if(confirm(`¿Resetear todos los checks de "${a}"? (No borra ítems editados)`)){for(const o of Object.values(n.data[a]))for(const c of o.items)c.checked=!1;v(n),C(),h(),$("✓ Colección reseteada")}})}function N(t){t.classList.add("open"),t.setAttribute("aria-hidden","false")}function r(t){t.classList.remove("open"),t.setAttribute("aria-hidden","true")}O.addEventListener("click",()=>{if(!d)return;const t=k.value.trim();if(!t)return;const{colId:e,catName:a,itemId:o}=d,c=n.data[e][a].items.find(s=>s.id===o);c&&(c.name=t,v(n),C(),h(),$("✓ Elemento actualizado")),r(u),d=null});J.addEventListener("click",()=>{if(!d)return;const{colId:t,catName:e,itemId:a}=d,o=n.data[t][e];o.items=o.items.filter(c=>c.id!==a),v(n),C(),h(),$("🗑 Elemento eliminado"),r(u),d=null});U.addEventListener("click",()=>{r(u),d=null});u.addEventListener("click",t=>{t.target===u&&(r(u),d=null)});k.addEventListener("keydown",t=>{t.key==="Enter"&&O.click(),t.key==="Escape"&&(r(u),d=null)});G.addEventListener("click",()=>{if(!m)return;const t=b.value.trim();if(!t){b.focus();return}const{colId:e,catName:a}=m,o={id:Y(),name:t,checked:!1};n.data[e][a].items.push(o),v(n),C(),h(),$(`➕ "${t}" añadido`),r(f),m=null});K.addEventListener("click",()=>{r(f),m=null});W.addEventListener("click",()=>{r(f),m=null});f.addEventListener("click",t=>{t.target===f&&(r(f),m=null)});b.addEventListener("keydown",t=>{t.key==="Enter"&&G.click(),t.key==="Escape"&&(r(f),m=null)});function ee(){T(),C(),h()}ee();
