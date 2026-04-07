"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─── SVG Icons ─── */
const IFlame   = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.11-3.66 5.65-2.7 8.87.06.22.12.44.12.67 0 .44-.36.82-.8.82-.42 0-.72-.27-.83-.65-.03-.1-.06-.2-.08-.31-1.14 1.6-1.33 3.75-.55 5.56.53 1.22 1.39 2.28 2.45 3.04.98.71 2.09 1.21 3.26 1.41.33.06.66.1.99.1 1.23.04 2.44-.26 3.47-.86 2.01-1.14 3.36-3.28 3.36-5.68 0-1.32-.43-2.57-1.14-3.6z"/></svg>;
const ILeaf    = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c7 0 13-5 13-12-3 0-7 1-11 4l3.17 3.17A4.98 4.98 0 0119 16c0 3.31-1.58 6.25-4 8.1A11.97 11.97 0 0017 8z"/></svg>;
const IStar    = ({s=16,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
const IPin     = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
const IPhone   = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
const IMail    = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
const IBag     = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>;
const IArrow   = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IPlus    = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IClock   = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>;
const IChef    = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z"/></svg>;
const ICheck   = ({s=16,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>;
const IMenu    = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IGlobe   = ({s=20,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.9 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.66-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>;
const ISparkle = ({s=14,...p}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3z"/></svg>;

/* ─── Data ─── */
const BG_SLIDES = [
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1600&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1600&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1600&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1600&q=90&auto=format&fit=crop",
];

const HERO_CARDS = [
  { img:"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=85&auto=format&fit=crop", name:"Butter Chicken", tag:"Signature",  price:"₹320" },
  { img:"https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&q=85&auto=format&fit=crop", name:"Dal Makhani",    tag:"Slow Cooked", price:"₹220" },
  { img:"https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=85&auto=format&fit=crop", name:"Paneer Tikka",   tag:"Chef's Pick",  price:"₹280" },
];

const MENU_ITEMS = [
  { id:1, name:"Butter Chicken",     desc:"72-hr slow-cooked tomato-cream gravy",          price:320, badge:"Bestseller",  veg:false, img:"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=85&auto=format&fit=crop", rating:"4.9" },
  { id:2, name:"Paneer Tikka",       desc:"Tandoor-charred cottage cheese, mint chutney",  price:280, badge:"Chef's Pick", veg:true,  img:"https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=85&auto=format&fit=crop", rating:"4.8" },
  { id:3, name:"Dal Makhani",        desc:"Black lentils simmered 12 hrs, butter & cream", price:220, badge:"Slow Cooked", veg:true,  img:"https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=85&auto=format&fit=crop", rating:"4.9" },
  { id:4, name:"Hyderabadi Biryani", desc:"Aged basmati dum-cooked, saffron & fried onion",price:380, badge:"Dum Cooked",  veg:false, img:"https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=85&auto=format&fit=crop", rating:"4.7" },
  { id:5, name:"Seekh Kebab",        desc:"Minced lamb skewers with ginger & coriander",   price:340, badge:"Tandoor",     veg:false, img:"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=85&auto=format&fit=crop", rating:"4.8" },
  { id:6, name:"Gulab Jamun",        desc:"Rose-cardamom syrup dumplings, served warm",    price:160, badge:"Sweet",       veg:true,  img:"https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&q=85&auto=format&fit=crop", rating:"4.9" },
];

const REVIEWS = [
  { name:"Priya Venkat",  loc:"Koramangala · Google", stars:5, q:"The butter chicken here is unlike anything in Bangalore. Rich, smoky, deeply flavourful. We come every weekend." },
  { name:"Rohan Shetty",  loc:"Indiranagar · Zomato",  stars:5, q:"Dal Makhani that tastes like grandmother's. The garlic naan is dangerously addictive. Absolute must visit!" },
  { name:"Aarti Joshi",   loc:"Whitefield · Swiggy",   stars:4, q:"Brought 12 family members for dad's birthday — every dish was outstanding. A complete experience." },
];

const STRIP_IMGS = [
  { src:"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80&auto=format&fit=crop", label:"Butter Chicken" },
  { src:"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80&auto=format&fit=crop", label:"Seekh Kebab" },
  { src:"https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80&auto=format&fit=crop", label:"Dum Biryani" },
  { src:"https://images.unsplash.com/photo-1630383249896-424e482df921?w=500&q=80&auto=format&fit=crop", label:"Dal Makhani" },
  { src:"https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80&auto=format&fit=crop", label:"Paneer Tikka" },
  { src:"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80&auto=format&fit=crop", label:"Garlic Naan" },
  { src:"https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=500&q=80&auto=format&fit=crop", label:"Gulab Jamun" },
];

/* ─── Scroll reveal ─── */
function useReveal(t=0.08): [React.RefObject<HTMLElement | null>, boolean] {
  const ref=useRef<HTMLElement | null>(null);const [vis,setVis]=useState(false);
  useEffect(()=>{
    const el=ref.current;if(!el||vis)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{threshold:t});
    obs.observe(el);return()=>obs.disconnect();
  });
  return [ref, vis] as [React.RefObject<HTMLElement | null>, boolean];
}

/* ─── Reveal div ─── */
function Reveal({children,vis,delay=0,style={}}: {children:React.ReactNode; vis:boolean; delay?:number; style?:React.CSSProperties}){
  return(
    <div style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(26px)",transition:`opacity .7s ease ${delay}s,transform .7s ease ${delay}s`,...style}}>
      {children}
    </div>
  );
}

/* ─── Loader ─── */
function Loader(){
  const [prog,setProg]=useState(0);
  const [step,setStep]=useState(0);
  const steps=["Heating the Tandoor…","Infusing royal spices…","Almost ready…"];
  useEffect(()=>{
    const pi=setInterval(()=>setProg(p=>Math.min(p+2,100)),38);
    const si=setInterval(()=>setStep(s=>(s+1)%3),1300);
    return()=>{clearInterval(pi);clearInterval(si);};
  },[]);
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#FFFBF0,#FFF0D0,#FFE4A0)",fontFamily:"Nunito,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Nunito:wght@400;700;800&family=Dancing+Script:wght@700&display=swap');
@keyframes lsp{to{transform:rotate(360deg)}}@keyframes lfl{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.22)}}@keyframes ldb{0%,100%{background:rgba(200,0,26,.18);transform:scaleY(1)}50%{background:#C8001A;transform:scaleY(2.2)}}`}</style>
      <div style={{textAlign:"center"}}>
        <div style={{position:"relative",width:100,height:100,margin:"0 auto 20px"}}>
          <svg viewBox="0 0 100 100" style={{position:"absolute",inset:0,width:"100%",height:"100%",animation:"lsp 2.5s linear infinite"}}>
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(200,0,26,.1)" strokeWidth="4"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#C8001A" strokeWidth="4"
              strokeDasharray={`${prog*2.76} 276`} strokeLinecap="round"
              style={{transformOrigin:"50px 50px",transform:"rotate(-90deg)"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <IFlame s={38} style={{color:"#C8001A",animation:"lfl 1.4s ease-in-out infinite"}}/>
          </div>
        </div>
        <div style={{fontFamily:"'Abril Fatface',serif",fontSize:26,color:"#C8001A",marginBottom:4}}>Spice Delight</div>
        <div style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"rgba(200,0,26,.45)",marginBottom:18,fontWeight:700}}>{steps[step]}</div>
        <div style={{display:"flex",gap:7,justifyContent:"center"}}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{width:5,height:14,borderRadius:3,animation:`ldb 1.2s ease-in-out ${i*.14}s infinite`}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
export default function SpiceDelightLight(){
  const router=useRouter();

  /* ── URL token/table extraction ── */
  const navigate=useCallback((path="/customer/cus-detail")=>{
    const p=new URLSearchParams(window.location.search);
    const token=p.get("token"),table=p.get("table")||p.get("tableNo")||p.get("tableNumber");
    let dest=path;const ex=[];
    if(token)ex.push(`token=${token}`);
    if(table)ex.push(`table=${table}`);
    if(ex.length)dest+=`?${ex.join("&")}`;
    router.push(dest);
  },[router]);

  const [loading,setLoading]=useState(true);
  const [revealed,setRevealed]=useState(false);
  const [slideIdx,setSlideIdx]=useState(0);
  const [prevIdx,setPrevIdx]=useState(BG_SLIDES.length-1);
  const [titlePhase,setTitlePhase]=useState(0);
  const [scrollY,setScrollY]=useState(0);
  const [curPos,setCurPos]=useState({x:-300,y:-300});
  const [curBig,setCurBig]=useState(false);
  const [mobOpen,setMobOpen]=useState(false);
  const [tableInfo,setTableInfo]=useState<{token?: string | null, table?: string | null} | null>(null);

  const canvasRef=useRef<HTMLCanvasElement | null>(null);
  const pxWrapRef=useRef<HTMLDivElement | null>(null);
  const pxImgRef=useRef<HTMLImageElement | null>(null);

  const [aboutRef,aboutVis]=useReveal(0.06);
  const [menuRef,menuVis]=useReveal(0.05);
  const [revRef,revVis]=useReveal(0.05);
  const [ctaRef,ctaVis]=useReveal(0.04);

  useEffect(()=>{
    const p=new URLSearchParams(window.location.search);
    const token=p.get("token"),table=p.get("table")||p.get("tableNo");
    if(token||table)setTableInfo({token,table});
  },[]);

  useEffect(()=>{
    const t=setTimeout(()=>{setLoading(false);setTimeout(()=>setRevealed(true),60);},3000);
    return()=>clearTimeout(t);
  },[]);

  useEffect(()=>{
    if(loading)return;
    const t1=setTimeout(()=>setTitlePhase(1),200);
    const t2=setTimeout(()=>setTitlePhase(2),500);
    const t3=setTimeout(()=>setTitlePhase(3),800);
    const onS=()=>setScrollY(window.scrollY);
    const onM=(e:MouseEvent)=>setCurPos({x:e.clientX,y:e.clientY});
    window.addEventListener("scroll",onS,{passive:true});
    window.addEventListener("mousemove",onM);
    const iv1=setInterval(()=>{
      setSlideIdx(p=>{setPrevIdx(p);return(p+1)%BG_SLIDES.length;});
    },5000);

    return()=>{
      clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);
      clearInterval(iv1);
      window.removeEventListener("scroll",onS);
      window.removeEventListener("mousemove",onM);
    };
  },[loading]);

  useEffect(()=>{
    const fn=()=>{
      const img=pxImgRef.current,wrap=pxWrapRef.current;
      if(!img||!wrap)return;
      const r=wrap.getBoundingClientRect();
      const pr=(window.innerHeight-r.top)/(window.innerHeight+r.height);
      img.style.transform=`translateY(calc(-15% + ${(pr-.5)*100}px))`;
    };
    window.addEventListener("scroll",fn,{passive:true});fn();
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  useEffect(()=>{
    const cv=canvasRef.current;if(!cv)return;
    const ctx=cv.getContext("2d");
    if(!ctx)return;
    let W:number,H:number,raf:number;
    const rs=()=>{W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;};
    rs();window.addEventListener("resize",rs,{passive:true});
    const COLS=["rgba(255,107,0,A)","rgba(200,0,26,A)","rgba(255,183,0,A)","rgba(255,60,0,A)"];
    const pts=Array.from({length:45},()=>({
      x:Math.random(),y:Math.random(),
      r:.8+Math.random()*2.2,vy:.00007+Math.random()*.00016,vx:(Math.random()-.5)*.00008,
      a:.04+Math.random()*.12,c:COLS[Math.floor(Math.random()*4)],
      w:Math.random()*Math.PI*2,ws:.005+Math.random()*.016,
    }));
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      pts.forEach(p=>{
        p.w+=p.ws;p.y=(p.y+p.vy)%1;p.x=((p.x+p.vx+Math.sin(p.w)*.00012)%1+1)%1;
        const px=p.x*W,py=p.y*H;
        const g=ctx.createRadialGradient(px,py,0,px,py,p.r*6);
        g.addColorStop(0,p.c.replace("A",(p.a*.9).toFixed(2)));
        g.addColorStop(.5,p.c.replace("A",(p.a*.28).toFixed(2)));
        g.addColorStop(1,"rgba(0,0,0,0)");
        ctx.beginPath();ctx.arc(px,py,p.r*6,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
      });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",rs);};
  },[]);

  const scrollTo=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
  const ih=()=>setCurBig(true),il=()=>setCurBig(false);

  if(loading)return <Loader/>;

  return(
    <>
    <style>{CSS}</style>
    <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,opacity:.4}}/>
    <div className={`cdot${curBig?" cb":""}`} style={{left:curPos.x,top:curPos.y}}/>
    <div className={`cring${curBig?" cb":""}`} style={{left:curPos.x,top:curPos.y}}/>

    {tableInfo&&(
      <div className="tbanner">
        {tableInfo.table&&<span><IPin s={13}/> Table {tableInfo.table}</span>}
        {tableInfo.token&&<span className="tbadge"><ICheck s={12}/> Scan &amp; Order Active</span>}
      </div>
    )}

    <nav className={scrollY>60?"sc":""} style={{top:tableInfo?"36px":"0"}}>
      <div className="nbrand">
        <div className="nicon"><IFlame s={26}/></div>
        <div>
          <strong className="nname">Spice Delight</strong>
          <span className="ntag">North Indian Café · Bangalore</span>
        </div>
      </div>
      <ul className="nlinks">
        {["about","menu","reviews","contact"].map(s=>(
          <li key={s}><a onClick={()=>scrollTo(s)}>{s.charAt(0).toUpperCase()+s.slice(1)}</a></li>
        ))}
      </ul>
      <button className="ncta" onClick={()=>navigate()} onMouseEnter={ih} onMouseLeave={il}>
        <span className="nshine"/><IBag s={15}/> Order Now
      </button>
      <button className="mhbg" onClick={()=>setMobOpen(p=>!p)}><IMenu s={22}/></button>
    </nav>

    <div className={`mmenu${mobOpen?" on":""}`} style={{top:tableInfo?"104px":"68px"}}>
      {["about","menu","reviews","contact"].map(s=>(
        <a key={s} onClick={()=>{scrollTo(s);setMobOpen(false);}}>{s.charAt(0).toUpperCase()+s.slice(1)}</a>
      ))}
      <button className="mmcta" onClick={()=>navigate()}><IBag s={15}/> Start Order</button>
    </div>

    <div className={`pwrap${revealed?" in":""}`}>

    {/* ════ HERO — editorial split layout ════
        LEFT  : full-bleed food photography crossfade panel
        RIGHT : warm cream content panel — professional, clean
        No rotating cards, no flying images
    ════════════════════════════════════════════════════════ */}
    <section id="hero" className="hero">

      {/* ── LEFT: Photo panel ── */}
      <div className="hphoto">
        {BG_SLIDES.map((src,i)=>(
          <div key={i} className={`hslide${i===slideIdx?" on":i===prevIdx?" out":""}`}>
            <img src={src} alt={`Slide ${i+1}`}/>
          </div>
        ))}

        {/* Slide number — editorial style */}
        <div className="hcounter">
          <span className="hc-cur">{String(slideIdx+1).padStart(2,"0")}</span>
          <span className="hc-sep"/>
          <span className="hc-tot">{String(BG_SLIDES.length).padStart(2,"0")}</span>
        </div>

        {/* Dot indicators */}
        <div className="hsdots">
          {BG_SLIDES.map((_,i)=>(
            <button key={i} className={`hsdot${i===slideIdx?" on":""}`}
              onClick={()=>{setPrevIdx(slideIdx);setSlideIdx(i);}}/>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="hscroll-cue">
          <div className="hsc-line"/><span>Scroll</span>
        </div>
      </div>

      {/* ── RIGHT: Content panel ── */}
      <div className="hcont">

        {/* Open badge */}
        <div className={`hbadge${titlePhase>=1?" show":""}`}>
          <div className="hpulse"/>
          <span>Open Now · MG Road, Bangalore</span>
        </div>

        {/* Title */}
        <h1 className="htitle">
          <span className={`hl${titlePhase>=1?" show":""}`}>Where Every</span>
          <span className={`hl accent${titlePhase>=2?" show":""}`} style={{transitionDelay:".1s"}}>Spice Tells</span>
          <span className={`hl${titlePhase>=3?" show":""}`} style={{transitionDelay:".2s"}}>a Story.</span>
        </h1>

        <p className={`hsub${titlePhase>=3?" show":""}`} style={{transitionDelay:".55s"}}>
          Authentic North Indian flavours crafted with love in the heart of Bangalore.
          From slow-cooked dals to smoky tandoor dishes — every bite is a journey north.
        </p>

        <div className={`hbtns${titlePhase>=3?" show":""}`} style={{transitionDelay:".72s"}}>
          <button className="bprim" onClick={()=>navigate()} onMouseEnter={ih} onMouseLeave={il}>
            <span className="bshine"/><IBag s={16}/> Start Your Order
          </button>
          <button className="bout2" onClick={()=>scrollTo("contact")}>
            <IPin s={15}/> Find Us
          </button>
        </div>

        <div className={`htags${titlePhase>=3?" show":""}`} style={{transitionDelay:".9s"}}>
          <span><ILeaf s={12} style={{color:"var(--saffron)"}}/> Pure Veg Available</span>
          <span><IFlame s={12} style={{color:"var(--saffron)"}}/> Live Tandoor</span>
          <span><IGlobe s={12} style={{color:"var(--saffron)"}}/> Dine-In &amp; Takeaway</span>
        </div>

        {/* Stats strip inside content panel */}
        <div className={`hstats${titlePhase>=3?" show":""}`} style={{transitionDelay:"1.1s"}}>
          {[["200+","Daily Diners"],["4.8","Google Rating"],["60+","Menu Items"]].map(([n,l],i)=>(
            <div key={l} className="hstat">
              <span className="hstat-n">{n}</span>
              <span className="hstat-l">{l}</span>
            </div>
          ))}
        </div>

      </div>

    </section>

    {/* STATS */}
    <div className="statsbar">
      {[["200+","Daily Diners"],["4.8★","Google Rating"],["60+","Menu Items"],["15+","Years of Craft"]].map(([n,l])=>(
        <div key={l} className="sitem">
          <span className="snum">{n}</span>
          <span className="slbl2">{l}</span>
        </div>
      ))}
    </div>

    {/* MARQUEE RED */}
    <div className="mqred">
      <div className="mqt">
        {[...Array(2)].flatMap((_,li)=>
          ["Butter Chicken","Garlic Naan","Dal Makhani","Seekh Kebab","Dum Biryani","Paneer Tikka","Masala Chai","Gulab Jamun"].map((t,i)=>(
            <span key={`${li}-${i}`} className="mqi"><ISparkle s={11}/>{t}</span>
          ))
        )}
      </div>
    </div>

    {/* ════ ABOUT ════ */}
    <section id="about" className="about-sec" ref={aboutRef}>
      <div className={`agrid${aboutVis?" vis":""}`}>
        <div className="aimg-wrap">
          <div className="aimg">
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=85&auto=format&fit=crop" alt="Interior"/>
            <div className="aglow"/>
          </div>
          <div className="abadge">Est. 2009 · Bangalore</div>
        </div>
        <div className="atext">
          <div className="slbl">Our Story</div>
          <h2>Crafted with <em>Tradition,</em><br/>Served with Love.</h2>
          <p className="bp">Born on the vibrant MG Road, Spice Delight began as a humble café with one mission — to bring the bold, comforting flavours of North India to every table in Bangalore.</p>
          <p className="bp">Each recipe is a family heirloom — slow-cooked gravies, hand-rolled breads fresh from the tandoor, and spice blends ground daily in our kitchen.</p>
          <div className="afacts">
            {[[<IFlame key="f" s={20}/>,"Fresh Daily","Spices ground every morning. No shortcuts."],
              [<ILeaf key="l" s={20}/>,"Veg Friendly","20+ pure veg options always available."],
              [<IFlame key="ff" s={20}/>,"Live Tandoor","Clay oven fires all day for smoky char."],
              [<IPin key="p" s={20}/>,"MG Road","Heart of Bangalore's dining district."],
            ].map(([ic,t,d])=>(
              <div key={String(t)} className="af" onMouseEnter={ih} onMouseLeave={il}>
                <div className="aficon">{ic}</div>
                <div><div className="aft">{t}</div><div className="afd">{d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* STRIP */}
    <div className="strip">
      <div className="sttrack">
        {[...STRIP_IMGS,...STRIP_IMGS].map((it,i)=>(
          <div key={i} className="sti">
            <img src={it.src} alt={it.label}/>
            <div className="stov"/><span className="stlbl">{it.label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* MARQUEE CREAM */}
    <div className="mqcream">
      <div className="mqt rev">
        {[...Array(2)].flatMap((_,li)=>
          ["Live Tandoor","Fresh Spices Daily","MG Road Bangalore","4.8 Google Rating","Dine-In & Takeaway","Open Till 11 PM","Master Chef Kitchen"].map((t,i)=>(
            <span key={`${li}-${i}`} className="mqci"><ICheck s={12} style={{color:"var(--crimson)"}}/>{t}</span>
          ))
        )}
      </div>
    </div>

    {/* ════ MENU ════ */}
    <section id="menu" className="menu-sec" ref={menuRef}>
      <Reveal vis={menuVis} delay={0}><div className="slbl">Our Menu</div></Reveal>
      <Reveal vis={menuVis} delay={.1}><h2>A Feast for <em>Every Craving.</em></h2></Reveal>
      <Reveal vis={menuVis} delay={.2}><p className="bp">Sixty dishes — starters, mains, breads, rice, desserts — all cooked to order.</p></Reveal>
      <div className={`mgrid${menuVis?" vis":""}`}>
        {MENU_ITEMS.map((item,i)=>(
          <div key={item.id} className="mc" style={{transitionDelay:`${i*.07}s`}} onMouseEnter={ih} onMouseLeave={il}>
            <div className="mcimg">
              <img src={item.img} alt={item.name}/>
              <div className="mcbadge">{item.badge}</div>
              {item.veg&&<div className="vegdot"/>}
              <div className="mcov"/>
            </div>
            <div className="mcbody">
              <div className="mcname">{item.name}</div>
              <div className="mcdesc">{item.desc}</div>
              <div className="mcfoot">
                <div>
                  <div className="mcprice">₹{item.price}</div>
                  <div className="mcrating"><IStar s={11} style={{color:"var(--saffron)"}}/> {item.rating}</div>
                </div>
                <button className="mcadd" onClick={()=>navigate()}><IPlus s={17}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Reveal vis={menuVis} delay={.55} style={{textAlign:"center",marginTop:36}}>
        <button className="bprim" onClick={()=>navigate()} onMouseEnter={ih} onMouseLeave={il}>
          <span className="bshine"/><IBag s={15}/> View Full Menu &amp; Order
        </button>
      </Reveal>
    </section>

    {/* PARALLAX */}
    <div className="pxwrap" ref={pxWrapRef}>
      <img ref={pxImgRef} src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&auto=format&fit=crop" alt=""/>
      <div className="pxov"/>
      <div className="pxcont">
        <ISparkle s={20} style={{color:"var(--gold)",marginBottom:10,filter:"drop-shadow(0 0 12px rgba(255,183,0,.7))"}}/>
        <blockquote>"Food is not just eating energy. It's an experience."</blockquote>
        <cite>— The Spice Delight Philosophy · MG Road, Bangalore</cite>
      </div>
    </div>

    {/* ════ REVIEWS ════ */}
    <section id="reviews" className="rev-sec" ref={revRef}>
      <Reveal vis={revVis} delay={0}><div className="slbl">Reviews</div></Reveal>
      <Reveal vis={revVis} delay={.1}><h2>Our Guests <em>Say It Best.</em></h2></Reveal>
      <div className={`rgrid${revVis?" vis":""}`}>
        {REVIEWS.map((r,i)=>(
          <div key={i} className="rcard" style={{transitionDelay:`${i*.1}s`}} onMouseEnter={ih} onMouseLeave={il}>
            <div className="rstars">{[0,1,2,3,4].slice(0,r.stars).map(j=><IStar key={j} s={13} style={{color:"var(--saffron)"}}/>)}</div>
            <p className="rquote">"{r.q}"</p>
            <div className="rauthor">
              <div className="rav">{r.name[0]}</div>
              <div><div className="rname">{r.name}</div><div className="rloc">{r.loc}</div></div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ════ CONTACT ════ */}
    <section id="contact" className="contact-sec">
      <div className="slbl">Find Us</div>
      <h2>Visit <em>Spice Delight</em> on MG Road.</h2>
      <div className="cgrid">
        <div>
          <div className="ccard">
            <div className="ccardtitle">Opening Hours</div>
            {[["Monday – Friday","11:00 AM – 11:00 PM"],["Saturday","10:00 AM – 11:30 PM"],["Sunday","10:00 AM – 10:30 PM"]].map(([d,t])=>(
              <div key={d} className="hrow"><span className="hday">{d}</span><span className="htime">{t}</span><span className="hstatus">Open</span></div>
            ))}
          </div>
          <div className="mapf">
            <img src="https://images.unsplash.com/photo-1569336415962-a4bd9f69c07a?w=800&q=70&auto=format&fit=crop" alt="map"/>
            <div className="mapo">
              <IPin s={28} style={{color:"var(--crimson)"}}/>
              <strong>MG Road, Bangalore</strong>
              <a href="https://maps.google.com" target="_blank" rel="noreferrer">Open in Maps <IArrow s={11}/></a>
            </div>
          </div>
        </div>
        <div className="ccard">
          <div className="ccardtitle">Contact &amp; Info</div>
          {[[<IPin key="p" s={18}/>,"Address","MG Road, Bangalore, KA 560001"],
            [<IPhone key="ph" s={18}/>,"Phone",<a key="ph-a" href="tel:8888888888">+91 88888 88888</a>],
            [<IMail key="m" s={18}/>,"Email",<a key="m-a" href="mailto:contact@spicedelight.com">contact@spicedelight.com</a>],
            [<IChef key="c" s={18}/>,"Type","North Indian · Café · Dine-In & Takeaway"],
            [<IClock key="cl" s={18}/>,"Hours","Open 7 days · 10 AM – 11 PM"],
          ].map(([ic,l,v])=>(
            <div key={String(l)} className="crow">
              <div className="cicon">{ic}</div>
              <div><div className="clbl">{l}</div><div className="cval">{v}</div></div>
            </div>
          ))}
          <button className="bprim" style={{width:"100%",justifyContent:"center",marginTop:20}} onClick={()=>navigate()} onMouseEnter={ih} onMouseLeave={il}>
            <span className="bshine"/><IBag s={15}/> Start Your Order
          </button>
        </div>
      </div>
    </section>

    {/* ════ CTA ════ */}
    <section className="cta-sec" ref={ctaRef}>
      <div className={`ctain${ctaVis?" vis":""}`}>
        <div className="ctaico"><IFlame s={52} style={{color:"var(--crimson)"}}/></div>
        <h2>Hungry? <em>Come In.</em><br/>We're Ready for You.</h2>
        <p className="bp" style={{maxWidth:460,margin:"14px auto 0",textAlign:"center"}}>Walk in anytime or call ahead. Hot food, warm service, MG Road vibes — every day.</p>
        <div className="ctabtns">
          <button className="bprim" onClick={()=>navigate()} onMouseEnter={ih} onMouseLeave={il}><span className="bshine"/><IBag s={15}/> Start Your Order</button>
          <a href="mailto:contact@spicedelight.com" className="bout2"><IMail s={15}/> Send a Message</a>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer>
      <div className="fgrid">
        <div>
          <div className="fbrand"><IFlame s={22} style={{color:"var(--yellow)"}}/> Spice Delight</div>
          <p className="fdesc">North Indian cuisine crafted with tradition, served with love. MG Road's favourite café since 2009.</p>
        </div>
        <div>
          <div className="fh">Quick Links</div>
          <ul className="flinks">
            {[["menu","Our Menu"],["about","About Us"],["reviews","Reviews"],["contact","Find Us"]].map(([id,label])=>(
              <li key={id}><a onClick={()=>scrollTo(id)}>{label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <div className="fh">Contact</div>
          <ul className="flinks">
            <li><a href="tel:8888888888">+91 88888 88888</a></li>
            <li><a href="mailto:contact@spicedelight.com">contact@spicedelight.com</a></li>
            <li><a>MG Road, Bangalore</a></li>
            <li><a>Open 10AM – 11PM</a></li>
          </ul>
        </div>
      </div>
      <div className="fbot">
        <span>© 2026 Spice Delight. All rights reserved.</span>
        <span style={{color:"var(--yellow)"}}>Made with love in Bangalore</span>
      </div>
    </footer>

    </div>
    </>
  );
}

/* ══════════ CSS ══════════ */
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Nunito:wght@300;400;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
:root{
  --white:#FFFFFF;--cream:#FFFBF2;--cream2:#FFF5DC;--cream3:#FFEDBA;
  --saffron:#FF9A00;--gold:#FFB700;--yellow:#FFD500;
  --crimson:#C8001A;--dark:#1C0505;--dark2:#3D0A0A;--body:#5A1A00;--muted:#A0522D;
  --border:rgba(200,0,26,.11);--glow:rgba(200,0,26,.32);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;overflow-x:hidden}
body{background:var(--cream);color:var(--dark);font-family:'Nunito',sans-serif;overflow-x:hidden}
img{display:block;max-width:100%}
a{text-decoration:none;color:inherit}
button{font-family:inherit;border:none;cursor:pointer;background:none}

@media(pointer:fine){body{cursor:none}}
.cdot{position:fixed;z-index:99999;pointer-events:none;width:10px;height:10px;background:var(--crimson);border-radius:50%;transform:translate(-50%,-50%);transition:width .2s,height .2s}
.cring{position:fixed;z-index:99998;pointer-events:none;width:34px;height:34px;border:1.5px solid rgba(200,0,26,.28);border-radius:50%;transform:translate(-50%,-50%);transition:width .3s,height .3s,opacity .3s}
.cdot.cb{width:16px;height:16px;background:var(--saffron)}
.cring.cb{width:56px;height:56px;opacity:.18}
@media(pointer:coarse){.cdot,.cring{display:none}}

.tbanner{position:fixed;top:0;left:0;right:0;z-index:2000;height:36px;background:linear-gradient(90deg,var(--crimson),var(--saffron));display:flex;align-items:center;justify-content:center;gap:18px;font-size:10px;font-weight:800;letter-spacing:2px;color:#fff;text-transform:uppercase}
.tbanner span{display:flex;align-items:center;gap:6px}
.tbadge{background:rgba(255,255,255,.18);padding:3px 10px;border-radius:50px;border:1px solid rgba(255,255,255,.28)}

.pwrap{opacity:0;transform:translateY(12px);transition:opacity .8s,transform .8s}
.pwrap.in{opacity:1;transform:translateY(0)}

nav{position:fixed;left:0;right:0;z-index:1000;height:68px;padding:0 5vw;display:flex;align-items:center;justify-content:space-between;background:rgba(255,251,242,.88);backdrop-filter:blur(22px);border-bottom:1px solid var(--border);transition:background .4s,box-shadow .4s}
nav.sc{background:rgba(255,251,242,.99);box-shadow:0 4px 26px rgba(200,0,26,.08)}
.nbrand{display:flex;align-items:center;gap:10px}
.nicon{color:var(--crimson);display:flex;animation:nwob 5s ease-in-out infinite}
@keyframes nwob{0%,80%,100%{transform:rotate(0)}85%{transform:rotate(-14deg)}93%{transform:rotate(8deg)}}
.nname{font-family:'Abril Fatface',serif;font-size:19px;color:var(--crimson);display:block;line-height:1.1}
.ntag{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);font-weight:700;display:block}
.nlinks{display:flex;gap:26px;list-style:none}
.nlinks a{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--body);font-weight:700;transition:color .3s;position:relative;cursor:pointer;padding-bottom:3px}
.nlinks a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:2px;background:var(--crimson);border-radius:1px;transition:width .3s}
.nlinks a:hover{color:var(--crimson)}.nlinks a:hover::after{width:100%}
.ncta{position:relative;overflow:hidden;background:linear-gradient(135deg,var(--crimson),var(--saffron));color:#fff;padding:10px 22px;border-radius:50px;font-size:11px;font-weight:800;letter-spacing:1.5px;display:flex;align-items:center;gap:7px;transition:transform .3s,box-shadow .3s;box-shadow:0 4px 18px var(--glow)}
.ncta:hover{transform:translateY(-2px);box-shadow:0 10px 28px var(--glow)}
.nshine{position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);transform:translateX(-100%);transition:transform .5s}
.ncta:hover .nshine{transform:translateX(100%)}
.mhbg{display:none;color:var(--crimson);padding:4px;align-items:center}
.mmenu{position:fixed;left:0;right:0;z-index:900;background:rgba(255,251,242,.99);backdrop-filter:blur(22px);border-bottom:1px solid var(--border);padding:20px 5vw 28px;transform:translateY(-10px);opacity:0;pointer-events:none;transition:transform .35s,opacity .35s}
.mmenu.on{transform:translateY(0);opacity:1;pointer-events:all}
.mmenu a{display:block;padding:13px 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--body);border-bottom:1px solid var(--border);font-weight:700;cursor:pointer}
.mmenu a:hover{color:var(--crimson)}
.mmcta{width:100%;margin-top:16px;padding:14px;background:linear-gradient(135deg,var(--crimson),var(--saffron));color:#fff;border-radius:50px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:8px}

/* ════ HERO — editorial split ════ */
.hero{
  position:relative;min-height:100svh;overflow:hidden;
  display:grid;grid-template-columns:1fr 1fr;
  background:var(--cream);
}

/* ── LEFT: Photo panel ── */
.hphoto{position:relative;overflow:hidden;background:#160303;min-height:100svh;}

/* Crossfade slides — clean, no zoom chaos */
.hslide{position:absolute;inset:0;opacity:0;transition:opacity 1.4s cubic-bezier(.4,0,.2,1);z-index:1}
.hslide.on{opacity:1;z-index:2}
.hslide.out{opacity:0;z-index:1}
.hslide img{
  width:100%;height:100%;object-fit:cover;
  transform:scale(1.04);
  transition:transform 7s ease;
}
.hslide.on img{transform:scale(1)}

/* Subtle gradient: only darkens bottom + very slight right edge where it meets content */
.hphoto::after{
  content:'';position:absolute;inset:0;z-index:3;pointer-events:none;
  background:
    linear-gradient(to bottom, transparent 55%, rgba(10,2,2,.62) 100%),
    linear-gradient(to right,  transparent 85%, rgba(255,251,242,.12) 100%);
}

/* Editorial slide counter — top-left of photo */
.hcounter{
  position:absolute;top:108px;left:32px;z-index:10;
  display:flex;align-items:center;gap:10px;
}
.hc-cur{font-family:'Abril Fatface',serif;font-size:44px;color:rgba(255,255,255,.9);line-height:1}
.hc-sep{width:28px;height:1px;background:rgba(255,255,255,.3)}
.hc-tot{font-size:13px;color:rgba(255,255,255,.35);font-weight:700;letter-spacing:1px;align-self:flex-end;margin-bottom:6px}

/* Slide dots — bottom left */
.hsdots{position:absolute;bottom:32px;left:32px;z-index:10;display:flex;gap:8px}
.hsdot{width:7px;height:7px;border-radius:50%;border:1.5px solid rgba(255,255,255,.38);background:transparent;cursor:pointer;transition:.3s;padding:0}
.hsdot.on{background:#fff;width:24px;border-radius:4px;border-color:transparent}

/* Scroll cue — bottom right of photo */
.hscroll-cue{
  position:absolute;bottom:32px;right:24px;z-index:10;
  display:flex;flex-direction:column;align-items:center;gap:7px;opacity:.42;
}
.hsc-line{width:1px;height:48px;background:linear-gradient(to bottom,rgba(255,255,255,.7),transparent);animation:scAnim 2.1s ease-in-out infinite}
@keyframes scAnim{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}50.01%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
.hscroll-cue span{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.52)}

/* ── RIGHT: Content panel ── */
.hcont{
  display:flex;flex-direction:column;justify-content:center;
  padding:clamp(96px,10vw,128px) clamp(32px,5vw,68px) 64px;
  position:relative;z-index:5;
  background:var(--cream);
  border-left:1px solid rgba(200,0,26,.07);
}
/* Warm subtle glow top-right */
.hcont::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(ellipse 70% 50% at 90% 15%,rgba(255,210,0,.07),transparent 60%),
             radial-gradient(ellipse 50% 40% at 5% 85%,rgba(200,0,26,.04),transparent 55%);
}

.hbadge{
  display:inline-flex;align-items:center;gap:9px;
  background:rgba(200,0,26,.07);border:1.5px solid rgba(200,0,26,.18);
  padding:7px 18px;border-radius:50px;
  font-size:10px;letter-spacing:2px;text-transform:uppercase;
  color:var(--crimson);font-weight:800;margin-bottom:26px;width:fit-content;
  opacity:0;transform:translateY(14px);transition:opacity .7s,transform .7s;
}
.hbadge.show{opacity:1;transform:translateY(0)}
.hpulse{width:7px;height:7px;background:#22c55e;border-radius:50%;animation:gp 1.3s ease-in-out infinite;flex-shrink:0}
@keyframes gp{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}50%{box-shadow:0 0 0 6px rgba(34,197,94,0)}}

.htitle{font-family:'Abril Fatface',serif;font-size:clamp(40px,5.5vw,80px);line-height:.96;letter-spacing:-.3px;margin-bottom:20px}
.hl{display:block;color:var(--dark);transform:translateY(50px);opacity:0;transition:transform .9s cubic-bezier(.16,1,.3,1),opacity .9s}
.hl.accent{background:linear-gradient(90deg,var(--crimson),var(--saffron));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hl.show{transform:translateY(0);opacity:1}

.hsub{font-size:clamp(13px,1.3vw,15px);color:var(--body);line-height:1.88;margin-bottom:30px;max-width:440px;opacity:0;transform:translateY(14px);transition:opacity .8s,transform .8s}
.hsub.show{opacity:1;transform:translateY(0)}
.hbtns{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;opacity:0;transform:translateY(14px);transition:opacity .8s,transform .8s}
.hbtns.show{opacity:1;transform:translateY(0)}
.htags{display:flex;flex-wrap:wrap;gap:14px;opacity:0;transform:translateY(12px);transition:opacity .8s,transform .8s}
.htags.show{opacity:1;transform:translateY(0)}
.htags span{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);font-weight:700;display:flex;align-items:center;gap:6px}

/* Mini stats row — bottom of content panel */
.hstats{
  display:flex;gap:0;margin-top:28px;padding-top:22px;
  border-top:1px solid rgba(200,0,26,.1);
  opacity:0;transform:translateY(12px);transition:opacity .8s,transform .8s;
}
.hstats.show{opacity:1;transform:translateY(0)}
.hstat{padding:0 26px 0 0;margin:0 26px 0 0;border-right:1px solid rgba(200,0,26,.1)}
.hstat:last-child{border:none;padding:0;margin:0}
.hstat-n{font-family:'Abril Fatface',serif;font-size:clamp(22px,2.8vw,34px);color:var(--crimson);display:block;line-height:1}
.hstat-l{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);font-weight:700;display:block;margin-top:3px}

@keyframes fu{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}

/* STATS */
.statsbar{display:grid;grid-template-columns:repeat(4,1fr);background:var(--white);border-bottom:1px solid var(--border)}
.sitem{padding:22px 16px;text-align:center;border-right:1px solid var(--border)}
.sitem:last-child{border:none}
.snum{font-family:'Abril Fatface',serif;font-size:clamp(26px,4vw,42px);color:var(--crimson);display:block;line-height:1}
.slbl2{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:4px;font-weight:700;display:block}

/* MARQUEES */
.mqred{overflow:hidden;padding:16px 0;background:var(--crimson)}
.mqcream{overflow:hidden;padding:15px 0;background:var(--cream3);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.mqt{display:flex;width:max-content;animation:mqs 28s linear infinite;user-select:none}
.mqt.rev{animation-direction:reverse}
.mqt:hover{animation-play-state:paused}
@keyframes mqs{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.mqi{display:inline-flex;align-items:center;gap:9px;padding:0 20px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:800;white-space:nowrap;color:rgba(255,255,255,.88)}
.mqci{display:inline-flex;align-items:center;gap:9px;padding:0 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:800;white-space:nowrap;color:var(--body)}

/* SECTIONS */
section{padding:90px 5vw;position:relative}
.slbl{font-size:10px;letter-spacing:5px;text-transform:uppercase;color:var(--crimson);margin-bottom:14px;font-weight:800;display:flex;align-items:center;gap:10px}
.slbl::before{content:'';width:26px;height:2px;background:var(--crimson);border-radius:1px}
h2{font-family:'Abril Fatface',serif;font-size:clamp(28px,4.5vw,54px);line-height:1.1;margin-bottom:16px;color:var(--dark)}
h2 em{font-style:italic;color:var(--crimson);font-family:'Dancing Script',cursive;font-weight:700}
.bp{font-size:14px;color:var(--body);line-height:1.85;max-width:520px;margin-bottom:12px}

/* ABOUT */
.about-sec{background:var(--cream2)}
.agrid{display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center}
.aimg-wrap{position:relative;opacity:0;transform:translateX(-34px);transition:opacity .8s,transform .8s}
.atext{opacity:0;transform:translateX(34px);transition:opacity .8s .14s,transform .8s .14s}
.agrid.vis .aimg-wrap,.agrid.vis .atext{opacity:1;transform:translateX(0)}
.aimg{position:relative;border-radius:24px;overflow:hidden;aspect-ratio:4/5;box-shadow:0 28px 70px rgba(200,0,26,.14)}
.aimg img{width:100%;height:100%;object-fit:cover;transition:transform 8s ease}
.aimg:hover img{transform:scale(1.04)}
.aglow{position:absolute;inset:-2px;border-radius:26px;background:linear-gradient(135deg,var(--crimson),var(--saffron),var(--yellow),var(--crimson));background-size:300% 300%;-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:destination-out;mask-composite:exclude;padding:2px;animation:grot 4s linear infinite}
@keyframes grot{0%{background-position:0%}100%{background-position:300%}}
.abadge{position:absolute;bottom:-14px;right:20px;background:var(--crimson);color:#fff;font-size:11px;font-weight:800;letter-spacing:1.5px;padding:10px 18px;border-radius:50px;box-shadow:0 8px 24px rgba(200,0,26,.35);text-transform:uppercase}
.afacts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px}
.af{display:flex;align-items:flex-start;gap:12px;padding:16px;background:var(--white);border:1px solid var(--border);border-radius:14px;transition:all .35s;box-shadow:0 2px 10px rgba(200,0,26,.04);cursor:default}
.af:hover{border-color:rgba(200,0,26,.24);transform:translateY(-4px);box-shadow:0 10px 28px rgba(200,0,26,.09)}
.aficon{color:var(--crimson);flex-shrink:0;margin-top:2px}
.aft{font-size:12px;font-weight:800;margin-bottom:3px;color:var(--dark)}
.afd{font-size:11px;color:var(--body);line-height:1.5}

/* STRIP */
.strip{overflow:hidden;padding:26px 0;background:var(--white);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.sttrack{display:flex;gap:16px;padding:4px 12px;width:max-content;animation:mqs 34s linear infinite}
.sttrack:hover{animation-play-state:paused}
.sti{flex-shrink:0;border-radius:18px;overflow:hidden;position:relative;width:clamp(180px,26vw,300px);height:clamp(180px,22vw,256px);border:2.5px solid rgba(255,255,255,.8);box-shadow:0 8px 28px rgba(200,0,26,.07);transition:transform .4s,box-shadow .4s}
.sti:hover{transform:scale(1.04);box-shadow:0 18px 48px rgba(200,0,26,.15)}
.sti img{width:100%;height:100%;object-fit:cover;transition:transform 5s ease}
.sti:hover img{transform:scale(1.07)}
.stov{position:absolute;inset:0;background:linear-gradient(180deg,transparent 52%,rgba(28,5,5,.6))}
.stlbl{position:absolute;bottom:12px;left:14px;font-family:'Dancing Script',cursive;font-size:16px;color:#fff;font-weight:700}

/* MENU */
.menu-sec{background:var(--cream)}
.mgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:28px}
.mc{border-radius:20px;overflow:hidden;background:var(--white);border:1px solid var(--border);transition:transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s,opacity .6s;box-shadow:0 4px 16px rgba(200,0,26,.04);opacity:0;transform:translateY(28px)}
.mgrid.vis .mc{opacity:1;transform:translateY(0)}
.mc:hover{transform:translateY(-8px)!important;box-shadow:0 24px 55px rgba(200,0,26,.13);border-color:rgba(200,0,26,.22)}
.mcimg{height:clamp(148px,20vw,210px);overflow:hidden;position:relative}
.mcimg img{width:100%;height:100%;object-fit:cover;transition:transform 5s ease}
.mc:hover .mcimg img{transform:scale(1.08)}
.mcov{position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(28,5,5,.4))}
.mcbadge{position:absolute;top:12px;left:12px;background:var(--crimson);padding:4px 10px;border-radius:50px;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#fff;font-weight:800;z-index:1}
.vegdot{position:absolute;top:12px;right:12px;width:20px;height:20px;border:2px solid #22c55e;background:rgba(255,255,255,.92);border-radius:4px;display:flex;align-items:center;justify-content:center;z-index:1}
.vegdot::before{content:'';width:8px;height:8px;border-radius:50%;background:#22c55e;display:block}
.mcbody{padding:16px 18px 18px}
.mcname{font-family:'Abril Fatface',serif;font-size:17px;margin-bottom:5px;color:var(--dark)}
.mcdesc{font-size:11px;color:var(--body);line-height:1.6;margin-bottom:12px}
.mcfoot{display:flex;align-items:center;justify-content:space-between}
.mcprice{font-family:'Abril Fatface',serif;font-size:20px;color:var(--crimson)}
.mcrating{font-size:11px;color:var(--muted);font-weight:600;display:flex;align-items:center;gap:4px;margin-top:3px}
.mcadd{width:34px;height:34px;background:linear-gradient(135deg,var(--crimson),var(--saffron));border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;transition:transform .3s,box-shadow .3s;cursor:pointer;box-shadow:0 4px 14px rgba(200,0,26,.3)}
.mcadd:hover{transform:scale(1.22);box-shadow:0 8px 22px rgba(200,0,26,.45)}

/* PARALLAX */
.pxwrap{height:clamp(300px,46vw,480px);overflow:hidden;position:relative}
.pxwrap img{width:100%;height:135%;object-fit:cover;will-change:transform;transform:translateY(-15%)}
.pxov{position:absolute;inset:0;background:linear-gradient(135deg,rgba(14,3,3,.66),rgba(28,8,0,.6));z-index:1}
.pxcont{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 5vw}
.pxcont blockquote{font-family:'Dancing Script',cursive;font-size:clamp(22px,4vw,50px);font-weight:700;color:#fff;line-height:1.3;max-width:760px;text-shadow:0 4px 16px rgba(0,0,0,.3)}
.pxcont cite{display:block;margin-top:14px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);font-style:normal;font-weight:800}

/* REVIEWS */
.rev-sec{background:var(--cream2)}
.rgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:38px}
.rcard{padding:28px 24px;border-radius:20px;background:var(--white);border:1px solid var(--border);position:relative;overflow:hidden;opacity:0;transform:translateY(26px);transition:transform .4s,box-shadow .4s,opacity .6s;box-shadow:0 4px 16px rgba(200,0,26,.04)}
.rgrid.vis .rcard{opacity:1;transform:translateY(0)}
.rcard::before{content:'"';position:absolute;top:-20px;left:12px;font-family:'Abril Fatface',serif;font-size:120px;color:rgba(200,0,26,.05);line-height:1;pointer-events:none}
.rcard:hover{transform:translateY(-6px)!important;box-shadow:0 20px 50px rgba(200,0,26,.11);border-color:rgba(200,0,26,.2)}
.rstars{display:flex;gap:2px;margin-bottom:14px}
.rquote{font-size:13px;color:var(--body);line-height:1.82;font-style:italic;margin-bottom:18px;position:relative;z-index:1}
.rauthor{display:flex;align-items:center;gap:10px}
.rav{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--crimson),var(--saffron));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;font-family:'Abril Fatface',serif;flex-shrink:0}
.rname{font-size:13px;font-weight:800;color:var(--dark)}
.rloc{font-size:10px;color:var(--muted);letter-spacing:.5px;font-weight:600}

/* CONTACT */
.contact-sec{background:var(--cream)}
.cgrid{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;margin-top:28px}
.ccard{background:var(--white);border:1px solid var(--border);border-radius:20px;padding:28px;box-shadow:0 4px 16px rgba(200,0,26,.04)}
.ccardtitle{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--crimson);font-weight:800;margin-bottom:18px}
.hrow{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid rgba(200,0,26,.05)}
.hrow:last-child{border:none}
.hday{font-size:13px;font-weight:700;color:var(--dark)}
.htime{font-size:12px;color:var(--body)}
.hstatus{font-size:9px;letter-spacing:1px;text-transform:uppercase;font-weight:800;color:#16a34a;background:rgba(22,163,74,.1);padding:3px 8px;border-radius:4px}
.mapf{margin-top:14px;border-radius:16px;overflow:hidden;height:200px;position:relative;border:1px solid var(--border)}
.mapf img{width:100%;height:100%;object-fit:cover;opacity:.5}
.mapo{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.mapo strong{font-size:13px;font-weight:800;color:var(--dark)}
.mapo a{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--crimson);background:rgba(255,255,255,.92);padding:7px 16px;border-radius:50px;border:1.5px solid var(--crimson);font-weight:800;transition:all .3s;display:flex;align-items:center;gap:5px}
.mapo a:hover{background:var(--crimson);color:#fff}
.crow{display:flex;align-items:flex-start;gap:14px;padding:12px 0;border-bottom:1px solid rgba(200,0,26,.05)}
.crow:last-of-type{border:none}
.cicon{color:var(--crimson);flex-shrink:0;margin-top:2px}
.clbl{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:4px;font-weight:700}
.cval{font-size:13px;color:var(--dark);font-weight:600}
.cval a{color:var(--crimson);transition:color .3s}.cval a:hover{color:var(--saffron)}

/* CTA */
.cta-sec{text-align:center;padding:96px 5vw;background:linear-gradient(135deg,var(--cream3),#FFE0A0,var(--cream3));position:relative;overflow:hidden}
.cta-sec::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 65% 55% at 50% 60%,rgba(200,0,26,.06),transparent 60%)}
.ctain{position:relative;z-index:1;opacity:0;transform:translateY(34px);transition:opacity .8s,transform .8s}
.ctain.vis{opacity:1;transform:translateY(0)}
.ctaico{display:flex;justify-content:center;margin-bottom:18px;animation:flpls 2.5s ease-in-out infinite}
@keyframes flpls{0%,100%{filter:drop-shadow(0 0 8px rgba(200,0,26,.28))}50%{filter:drop-shadow(0 0 26px rgba(200,0,26,.72))}}
.ctabtns{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;margin-top:34px}

/* BUTTONS */
.bprim{position:relative;overflow:hidden;background:linear-gradient(135deg,var(--crimson),var(--saffron));color:#fff;padding:14px 30px;border-radius:50px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;transition:transform .3s,box-shadow .3s;display:inline-flex;align-items:center;gap:8px;box-shadow:0 6px 22px rgba(200,0,26,.3);cursor:pointer;border:none}
.bprim:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(200,0,26,.45)}
.bshine{position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);transform:translateX(-100%);transition:transform .5s}
.bprim:hover .bshine{transform:translateX(100%)}
.bout{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.78);border:2px solid rgba(255,255,255,.28);padding:12px 26px;border-radius:50px;transition:all .3s;cursor:pointer;background:none}
.bout:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.6);color:#fff}
.bout2{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--crimson);border:2px solid var(--crimson);padding:12px 26px;border-radius:50px;transition:all .3s;cursor:pointer;background:none}
.bout2:hover{background:var(--crimson);color:#fff}

/* FOOTER */
footer{padding:52px 5vw 22px;background:var(--dark2)}
.fgrid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:44px;margin-bottom:36px}
.fbrand{font-family:'Abril Fatface',serif;font-size:22px;color:var(--yellow);display:flex;align-items:center;gap:8px;margin-bottom:10px}
.fdesc{font-size:12px;color:rgba(255,210,150,.55);line-height:1.8;max-width:260px}
.fh{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:14px;font-weight:800}
.flinks{list-style:none;display:flex;flex-direction:column;gap:10px}
.flinks li a{font-size:12px;color:rgba(255,210,150,.45);transition:color .3s;cursor:pointer}
.flinks li a:hover{color:var(--yellow)}
.fbot{padding-top:22px;border-top:1px solid rgba(255,210,150,.12);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;font-size:11px;color:rgba(255,210,150,.32)}

/* RESPONSIVE */
@media(max-width:1060px){
  .hero{grid-template-columns:1fr;min-height:auto}
  .hphoto{min-height:60vw;max-height:520px}
  .hcounter{top:24px;left:20px}
  .hcont{padding:44px 5vw 56px;border-left:none;border-top:1px solid rgba(200,0,26,.07)}
  .htitle{font-size:clamp(36px,8vw,58px)}
  .hstats{display:none}
  .agrid{grid-template-columns:1fr}
  .cgrid{grid-template-columns:1fr}
  .rgrid{grid-template-columns:1fr 1fr}
  .fgrid{grid-template-columns:1fr 1fr}
  .nlinks,.ncta{display:none}
  .mhbg{display:flex!important}
  .statsbar{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:700px){
  section{padding:58px 5vw}
  .mgrid{grid-template-columns:1fr 1fr}
  .rgrid{grid-template-columns:1fr}
  .fgrid{grid-template-columns:1fr}
}
@media(max-width:480px){
  .mgrid{grid-template-columns:1fr}
  .afacts{grid-template-columns:1fr 1fr}
}
`;
