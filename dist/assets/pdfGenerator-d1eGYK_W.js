import{_ as T}from"./pdf-B3J9CgwY.js";async function E(e){try{const s=await fetch(e);if(!s.ok)return"";const d=await s.blob();return await new Promise(i=>{const n=new FileReader;n.onloadend=()=>i(n.result),n.readAsDataURL(d)})}catch{return""}}function D(){const e=new Date,s=e.getFullYear(),d=String(e.getMonth()+1).padStart(2,"0"),i=String(e.getDate()).padStart(2,"0"),n=String(e.getHours()).padStart(2,"0"),m=String(e.getMinutes()).padStart(2,"0");return`COT-${s}-${d}-${i}-${n}-${m}`}function _(e,s,d,i){const n=d?`<img src="${d}" alt="KONTAXES" style="height:56px;width:auto;" />`:'<div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-1px;">KONTAXES</div>',m=e.breakdown.map(t=>`
    <tr>
      <td>${t.item}${t.note?`<br/><span class="note">${t.note}</span>`:""}</td>
      <td class="amount">Q ${t.cost.toLocaleString("es-GT",{minimumFractionDigits:2})}</td>
    </tr>`).join(""),c=e.warnings.map(t=>`<div class="warning-item">⚠ ${t}</div>`).join(""),r=e.empresa?` de tu empresa <strong>${e.empresa}</strong>`:"",l=[];e.whatsapp&&l.push(`al número de teléfono <strong>${e.whatsapp}</strong>`),e.correo&&l.push(`al correo <strong>${e.correo}</strong>`);const f=l.length?` Podemos contactarte ${l.join(" y ")} para continuar compartiendo información.`:"",h=()=>{if(!e.nombre)return"";const t=e.pdfVariant??"contable";let p="";return t==="saas"?p=`es un gusto presentarte una cotización estimada del costo del derecho de uso y acceso a nuestra base de datos de Odoo V19 Enterprise, para ser el aliado estratégico${r}, y evitar los grandes costos de implementación.`:t==="outsourcing"?p=`es un gusto presentarte una cotización estimada del costo del servicio de outsourcing contable para ser el aliado estratégico${r}.`:p=`es un gusto presentarte una cotización estimada del costo de nuestros servicios profesionales para ser el aliado estratégico${r}.`,`
    <div class="intro-para">
      Estimado(a) <strong>${e.nombre}</strong>, ${p}
      A continuación te compartimos el detalle de los servicios y los costos correspondientes estimados.${f}
    </div>`};return`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${s}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;font-size:13px;line-height:1.5;}

    .header{
      background:linear-gradient(135deg,#0f0a1e 0%,#1e0a4a 35%,#2d1065 65%,#0f3460 100%);
      padding:32px 48px 28px;
      position:relative;
      overflow:hidden;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:24px;
    }
    .deco-circle-1{position:absolute;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(147,51,234,0.18),transparent 70%);top:-120px;right:160px;pointer-events:none;}
    .deco-circle-2{position:absolute;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(16,185,129,0.12),transparent 70%);bottom:-60px;right:40px;pointer-events:none;}
    .deco-circle-3{position:absolute;width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.15),transparent 70%);top:10px;left:40%;pointer-events:none;}
    .deco-grid{position:absolute;inset:0;pointer-events:none;opacity:0.06;
      background-image:radial-gradient(circle,#fff 1px,transparent 1px);
      background-size:18px 18px;}
    .deco-bar{position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#7c3aed,#10b981,#7c3aed);opacity:0.7;}

    .header-left{position:relative;z-index:1;}
    .header-tagline{color:#c4b5fd;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;margin-top:5px;}
    .header-contact{color:#a78bfa;font-size:10px;margin-top:8px;line-height:1.7;}
    .header-right{position:relative;z-index:1;text-align:right;flex-shrink:0;}
    .quote-box{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:12px 18px;color:#fff;}
    .quote-box .q-label{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#c4b5fd;margin-bottom:4px;}
    .quote-box .q-number{font-size:13px;font-weight:700;letter-spacing:0.5px;color:#fff;}
    .quote-box .q-date{font-size:10px;color:#a78bfa;margin-top:3px;}

    .body{padding:32px 48px;}
    .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#7c3aed;margin-bottom:10px;border-bottom:2px solid #f3e8ff;padding-bottom:5px;}
    .intro-para{font-size:12px;color:#374151;line-height:1.75;margin-bottom:22px;padding:16px 20px;background:#faf5ff;border-left:4px solid #9333ea;border-radius:0 8px 8px 0;}

    .breakdown-table{width:100%;border-collapse:collapse;margin-bottom:0;}
    .breakdown-table thead tr{background:linear-gradient(90deg,#6d28d9,#5b21b6);}
    .breakdown-table thead th{color:#fff;padding:9px 14px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;}
    .breakdown-table thead th.amount{text-align:right;}
    .breakdown-table tbody tr{border-bottom:1px solid #ede9fe;}
    .breakdown-table tbody tr:nth-child(even){background:#faf5ff;}
    .breakdown-table tbody td{padding:10px 14px;font-size:12px;color:#374151;vertical-align:top;}
    .breakdown-table .note{font-size:10px;color:#9ca3af;font-style:italic;margin-top:2px;}
    .breakdown-table .amount{text-align:right;font-weight:600;color:#6d28d9;white-space:nowrap;}
    .total-row td{background:linear-gradient(90deg,#f5f3ff,#ede9fe)!important;padding:13px 14px!important;font-weight:700!important;font-size:13px!important;border-top:2px solid #7c3aed!important;}
    .total-row .amount{color:#7c3aed!important;font-size:17px!important;}

    .warnings-box{background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 18px;margin-top:18px;}
    .warning-item{font-size:11px;color:#92400e;padding:3px 0;}
    .disclaimer{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;margin-top:18px;font-size:11px;color:#1e40af;line-height:1.6;}

    .signature-section{margin-top:32px;padding-top:20px;border-top:1px solid #e0e7ff;}
    .sig-block{display:inline-block;text-align:center;min-width:200px;}
    .sig-img{height:68px;width:auto;display:block;margin:0 auto 4px;}
    .sig-line{border-top:1px solid #374151;margin:4px 0;}
    .sig-name{font-weight:700;font-size:12px;color:#1a1a2e;margin-top:3px;}
    .sig-role{font-size:11px;color:#6d28d9;}
    .sig-company{font-size:10px;color:#6b7280;margin-top:1px;}
  </style>
</head>
<body>
  <div class="header">
    <div class="deco-grid"></div>
    <div class="deco-circle-1"></div>
    <div class="deco-circle-2"></div>
    <div class="deco-circle-3"></div>
    <div class="deco-bar"></div>
    <div class="header-left">
      ${n}
      <div class="header-tagline">De Números a Decisiones</div>
      <div class="header-contact">
        KONTAXES CONSULTORES, S.A.<br/>
        info@kontaxes.com &nbsp;·&nbsp; +502 3517 4713
      </div>
    </div>
    <div class="header-right">
      <div class="quote-box">
        <div class="q-label">Cotización Estimada</div>
        <div class="q-number">${s}</div>
        <div class="q-date">${e.date}</div>
      </div>
    </div>
  </div>

  <div class="body">
    ${h()}

    <div>
      <div class="section-title">Desglose de Cotización</div>
      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th class="amount">Monto Mensual</th>
          </tr>
        </thead>
        <tbody>
          ${m}
          <tr class="total-row">
            <td>TOTAL MENSUAL ESTIMADO</td>
            <td class="amount">Q ${e.total.toLocaleString("es-GT",{minimumFractionDigits:2})}</td>
          </tr>
        </tbody>
      </table>

      ${c?`
      <div class="warnings-box">
        <div style="font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin-bottom:5px;">Notas Importantes</div>
        ${c}
      </div>`:""}
    </div>

    <div class="disclaimer">
      ${e.pdfVariant==="saas"?`
      <strong>IMPORTANTE:</strong> Esta es una cotización estimada de un servicio SaaS, NO un documento formal.
      El servicio consiste en el derecho de uso y acceso a nuestra base de datos Odoo V19 Enterprise — no es una implementación propia del cliente.
      Incluye acceso a nuestros módulos preinstalados. Módulos adicionales se desarrollan con costo separado.
      Los precios están en Quetzales (GTQ).`:`
      <strong>IMPORTANTE:</strong> Esta es una cotización estimada, NO un documento formal. Para formalizar el servicio se
      enviará la propuesta oficial, cotización formal y contrato de servicios profesionales.
      Los precios están en Quetzales (GTQ) e incluyen IVA.`}
    </div>

    <div class="signature-section">
      <div class="sig-block">
        ${i?`<img src="${i}" alt="Firma" class="sig-img" />`:'<div style="height:68px;"></div>'}
        <div class="sig-line"></div>
        <div class="sig-name">Kevin A. Santos C.</div>
        <div class="sig-role">Gerente General</div>
        <div class="sig-company">KONTAXES CONSULTORES, S.A.</div>
      </div>
    </div>
  </div>
</body>
</html>`}async function I(e){const[s,d]=await Promise.all([E("/K_white.png"),E("/firma-kevin.png")]),i=D(),n=`${i}.pdf`,m=_(e,i,s,d),c=document.createElement("iframe");c.style.cssText="position:fixed;left:-9999px;top:0;width:816px;height:2400px;border:none;",document.body.appendChild(c);const r=c.contentDocument;r.open(),r.write(m),r.close();const l=Array.from(r.querySelectorAll("img"));await Promise.all(l.map(o=>o.complete?Promise.resolve():new Promise(a=>{o.onload=()=>a(),o.onerror=()=>a()}))),await new Promise(o=>setTimeout(o,300));const f=r.documentElement.scrollHeight;c.style.height=`${f}px`,await new Promise(o=>setTimeout(o,100));const h=(await T(async()=>{const{default:o}=await import("./pdf-B3J9CgwY.js").then(a=>a.h);return{default:o}},[])).default,t=await h(r.body,{scale:2,useCORS:!0,allowTaint:!1,logging:!1,backgroundColor:"#ffffff",width:816,height:f,windowWidth:816,windowHeight:f});document.body.removeChild(c);const{jsPDF:p}=await T(async()=>{const{jsPDF:o}=await import("./pdf-B3J9CgwY.js").then(a=>a.j);return{jsPDF:o}},[]),u=new p({orientation:"portrait",unit:"mm",format:"letter"}),v=215.9,k=279.4,w=v/t.width,z=t.height*w;if(z<=k){const o=t.toDataURL("image/jpeg",.93);u.addImage(o,"JPEG",0,0,v,z)}else{const o=Math.floor(k/w);let a=0,S=!0;for(;a<t.height;){const x=Math.min(o,t.height-a),g=document.createElement("canvas");g.width=t.width,g.height=x;const y=g.getContext("2d");y.fillStyle="#ffffff",y.fillRect(0,0,g.width,g.height),y.drawImage(t,0,a,t.width,x,0,0,t.width,x);const O=g.toDataURL("image/jpeg",.93),A=x*w;S||u.addPage(),u.addImage(O,"JPEG",0,0,v,A),a+=o,S=!1}}const $=u.output("blob"),P=URL.createObjectURL($),b=document.createElement("a");return b.href=P,b.download=n,document.body.appendChild(b),b.click(),document.body.removeChild(b),setTimeout(()=>URL.revokeObjectURL(P),6e4),{blob:$,filename:n,quoteNumber:i}}export{I as generateQuotationPDF};
