const $ = (s) => document.querySelector(s);
const view = $("#view");
const modal = $("#modal");
const modalContent = $("#modalContent");

const seed = {
  role: null,
  adminTab: "dashboard",
  participantTab: "events",
  selectedEventId: "evt-1",
  notifications: [
    { id: 1, msg: "Venue changed to Seminar Hall 2", event: "TechTalks", time: "Mar 30, 9:00 AM" },
    { id: 2, msg: "Don't forget to bring your student ID!", event: "CodeSprint", time: "Mar 14, 6:00 PM" }
  ],
  events: [
    { id:"evt-1",name:"CodeSprint Hackathon",date:"2026-03-15",time:"09:00",venue:"Main Auditorium, Block A",desc:"24-hour hackathon.",max:100,fee:0,reg:3,checkin:1,revenue:20 },
    { id:"evt-2",name:"Design Jam",date:"2026-03-20",time:"14:00",venue:"https://meet.google.com/abc-defg-hij",desc:"Online UI challenge.",max:50,fee:10,reg:1,checkin:0,revenue:10 },
    { id:"evt-3",name:"TechTalks: AI & Beyond",date:"2026-04-02",time:"16:00",venue:"Seminar Hall 2, CS Block",desc:"Guest speakers.",max:200,fee:5,reg:2,checkin:0,revenue:10 }
  ],
  participants: [
    { id:"u1",name:"Participant user-1",paid:true,checkedIn:true },
    { id:"u2",name:"Participant user-2",paid:true,checkedIn:false },
    { id:"u3",name:"Participant user-3",paid:false,checkedIn:false }
  ],
  feed: ["Mentors are available at Station 3 for any queries.","Registration desks are now open! Head to Block A lobby."],
  teams: [
    { id:"t1",name:"Byte Busters",event:"CodeSprint Hackathon",tags:["React","Python","UI/UX"],members:2,owner:true,code:"BYTE2026" },
    { id:"t2",name:"Pixel Pioneers",event:"CodeSprint Hackathon",tags:["Figma","Tailwind CSS","Node.js"],members:1,owner:false,code:"PIXEL7" }
  ],
  my: { registered:["evt-1","evt-2"], teams:["t1"] }
};

let state = JSON.parse(localStorage.getItem("festhub_state") || "null") || seed;
const save = () => localStorage.setItem("festhub_state", JSON.stringify(state));

function show(screenId){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}
function iconTab(id, label, active){
  return `<button class="tab ${active ? "active" : ""}" data-tab="${id}">${label}</button>`;
}

function renderNav(){
  const nav = $("#mainNav");
  if(state.role === "admin"){
    nav.innerHTML = iconTab("dashboard","Dashboard",state.adminTab==="dashboard")
      + iconTab("create","Create Event",state.adminTab==="create")
      + iconTab("analytics","Analytics",state.adminTab==="analytics");
  }else{
    nav.innerHTML = iconTab("events","Events",state.participantTab==="events")
      + iconTab("teams","Teams",state.participantTab==="teams")
      + iconTab("my","My Dashboard",state.participantTab==="my");
  }
}

function adminView(){
  if(state.adminTab === "create") return renderCreateEvent();
  if(state.adminTab === "analytics") return renderAnalytics();

  const cards = state.events.map(e => {
    const pct = Math.min(100, (e.reg / e.max) * 100);
    return `<article class="card">
      <h3>${e.name}</h3>
      <div class="muted">${new Date(e.date).toDateString()} at ${e.time}</div>
      <div class="muted">${e.venue}</div>
      <div class="muted">${e.reg} / ${e.max} registered</div>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="row" style="margin-top:10px">
        <button class="btn-soft" data-open-event="${e.id}">Open Event</button>
      </div>
    </article>`;
  }).join("");

  view.innerHTML = `
    <div class="row"><div><h1>Admin Dashboard</h1><p class="muted">Manage all your events</p></div>
    <button class="btn-primary" id="jumpCreate">+ Create Event</button></div>
    <div class="grid-3">${cards}</div>
  `;
}

function renderCreateEvent(){
  view.innerHTML = `
    <h1>Create New Event</h1>
    <form class="card form" id="eventForm">
      <label>Event Name *</label><input required name="name" placeholder="e.g. CodeSprint Hackathon"/>
      <label>Date *</label><input required name="date" type="date"/>
      <label>Time *</label><input required name="time" type="time"/>
      <label>Venue / Meet Link *</label><input required name="venue" placeholder="Auditorium or Meet link"/>
      <label>Description</label><textarea name="desc" rows="3"></textarea>
      <div class="grid-3">
        <div><label>Max Participants</label><input type="number" name="max" value="50"/></div>
        <div><label>Registration Fee ($)</label><input type="number" name="fee" value="0"/></div>
      </div>
      <button class="btn-primary">Create Event</button>
    </form>
  `;
}

function renderAnalytics(){
  const totalReg = state.events.reduce((a,b)=>a+b.reg,0);
  const totalRevenue = state.events.reduce((a,b)=>a+b.revenue,0);
  const checked = state.events.reduce((a,b)=>a+b.checkin,0);
  view.innerHTML = `
    <h1>Analytics Dashboard</h1>
    <p class="muted">Platform-wide and per-event insights</p>
    <div class="stats">
      <div class="card stat"><b>${state.events.length}</b><div class="muted">Total Events</div></div>
      <div class="card stat"><b>${totalReg}</b><div class="muted">Total Registrations</div></div>
      <div class="card stat"><b>${checked}</b><div class="muted">Checked In</div></div>
      <div class="card stat"><b>$${totalRevenue}</b><div class="muted">Total Revenue</div></div>
      <div class="card stat"><b>${Math.round((checked/(totalReg||1))*100)}%</b><div class="muted">Avg Attendance</div></div>
      <div class="card stat"><b>${state.teams.length}</b><div class="muted">Teams Formed</div></div>
    </div>
    <div class="grid-3" style="margin-top:12px">
      <div class="card" style="grid-column:span 2">
        <h3>Registrations vs Check-ins</h3>
        <div class="chart">
          ${state.events.map(e=>`<div style="flex:1"><div class="bar alt" style="height:${e.reg*18}px"></div><div class="bar" style="height:${e.checkin*18}px;margin-top:6px"></div><small>${e.name.slice(0,8)}...</small></div>`).join("")}
        </div>
      </div>
      <div class="card"><h3>Registration Distribution</h3>${state.events.map(e=>`<p>${e.name}: <b>${e.reg}</b></p>`).join("")}</div>
    </div>
  `;
}

function participantView(){
  if(state.participantTab === "teams") return renderTeams();
  if(state.participantTab === "my") return renderMyDashboard();

  const cards = state.events.map(e => {
    const isReg = state.my.registered.includes(e.id);
    return `<article class="card">
      <div class="row"><h3>${e.name}</h3>${isReg?'<span class="pill">Registered</span>': e.fee?`<span class="pill">$${e.fee}</span>`:""}</div>
      <p class="muted">${e.desc}</p>
      <div class="muted">${new Date(e.date).toDateString()} at ${e.time}</div>
      <div class="muted">${e.venue}</div>
      <div class="muted">${e.reg} / ${e.max}</div>
      <div class="row" style="margin-top:10px">
        <button class="btn-soft" data-open-feed="${e.id}">View Feed</button>
        ${isReg ? "" : `<button class="btn-primary" data-register="${e.id}">Register ${e.fee ? `- $${e.fee}` : ""}</button>`}
      </div>
    </article>`;
  }).join("");

  view.innerHTML = `<h1>Browse Events</h1><p class="muted">Discover and register for exciting events</p><div class="grid-3">${cards}</div>`;
}

function renderTeams(){
  view.innerHTML = `
    <div class="row"><div><h1>Team Formation</h1><p class="muted">Create or join a team</p></div>
    <button class="btn-primary" id="createTeamBtn">+ Create Team</button></div>
    <div class="grid-3">
      ${state.teams.map(t => `<article class="card">
        <div class="row"><h3>${t.name}</h3><span class="muted">${t.members} members</span></div>
        <div class="muted">${t.event}</div>
        <p>${t.tags.map(x=>`<span class="pill">${x}</span>`).join(" ")}</p>
        ${t.owner ? `<button class="btn-soft copy" data-code="${t.code}">Copy Invite: ${t.code}</button>` : `<button class="btn-primary join-team" data-team="${t.id}">Request to Join</button>`}
      </article>`).join("")}
    </div>
  `;
}

function renderMyDashboard(){
  const myEvents = state.events.filter(e => state.my.registered.includes(e.id));
  const myTeams = state.teams.filter(t => state.my.teams.includes(t.id));
  view.innerHTML = `
    <h1>My Dashboard</h1><p class="muted">Your events and teams at a glance</p>
    <div class="grid-3">
      <div class="card stat"><b>${myEvents.length}</b><div class="muted">Events Registered</div></div>
      <div class="card stat"><b>${myTeams.length}</b><div class="muted">Teams Joined</div></div>
      <div class="card stat"><b>${myEvents.filter(e => new Date(e.date) > new Date()).length}</b><div class="muted">Upcoming</div></div>
    </div>
    <h2>My Events</h2>
    ${myEvents.map(e=>`<div class="list-item"><b>${e.name}</b><div class="muted">${new Date(e.date).toDateString()} ${e.time}</div></div>`).join("")}
    <h2>My Teams</h2>
    ${myTeams.map(t=>`<div class="list-item"><b>${t.name}</b> - <span class="muted">${t.members} members</span></div>`).join("")}
  `;
}

function renderEventDetails(eventId){
  const e = state.events.find(x=>x.id===eventId);
  if(!e) return;
  view.innerHTML = `
    <h1>${e.name}</h1><p class="muted">${e.desc}</p>
    <div class="card row">
      <div><b>${e.checkin}</b><div class="muted">Checked In</div></div>
      <div><b>${e.reg}</b><div class="muted">Registered</div></div>
      <div><b>$${e.revenue}</b><div class="muted">Revenue</div></div>
    </div>
    <div class="tabs-inline" style="margin-top:12px">
      <button class="active">Participants</button>
      <button>QR Attendance</button>
      <button>Live Feed</button>
      <button>Notifications</button>
    </div>
    ${state.participants.map(p=>`<div class="list-item row"><div>${p.name} ${p.paid?'<span class="pill">Paid</span>':'<span class="pill" style="background:#ffe8e8;color:#b74646">Unpaid</span>'}</div><span class="pill">${p.checkedIn?'Checked In':'Pending'}</span></div>`).join("")}
    <button class="ghost" id="backAdmin">← Back</button>
  `;
}

function renderNotificationModal(){
  modal.classList.remove("hidden");
  modalContent.innerHTML = `
    <div class="row"><h3>Notifications</h3><button id="closeModal" class="ghost">✕</button></div>
    ${state.notifications.map(n=>`<div class="list-item"><b>${n.event}</b><div>${n.msg}</div><small class="muted">${n.time}</small></div>`).join("")}
  `;
}

function render(){
  renderNav();
  if(state.role === "admin") adminView();
  if(state.role === "participant") participantView();
  save();
}

document.addEventListener("click",(e)=>{
  const tab = e.target.closest(".tab");
  if(tab){
    if(state.role==="admin") state.adminTab = tab.dataset.tab;
    else state.participantTab = tab.dataset.tab;
    return render();
  }
  if(e.target.id === "goRole") return show("roleSelect");
  const roleCard = e.target.closest(".role-card");
  if(roleCard){
    state.role = roleCard.dataset.role;
    show("app");
    return render();
  }
  if(e.target.id === "logoutBtn"){ state.role = null; save(); show("roleSelect"); return; }
  if(e.target.id === "notifyBtn") return renderNotificationModal();
  if(e.target.id === "closeModal" || e.target.id === "modal") modal.classList.add("hidden");
  if(e.target.id === "jumpCreate"){ state.adminTab = "create"; return render(); }

  const openEvent = e.target.closest("[data-open-event]");
  if(openEvent) return renderEventDetails(openEvent.dataset.openEvent);

  if(e.target.id === "backAdmin"){ state.adminTab = "dashboard"; return render(); }

  const regBtn = e.target.closest("[data-register]");
  if(regBtn){
    const id = regBtn.dataset.register;
    const event = state.events.find(x=>x.id===id);
    if(event.fee > 0){
      modal.classList.remove("hidden");
      modalContent.innerHTML = `
        <div class="row"><h3>${event.name}</h3><button id="closeModal" class="ghost">✕</button></div>
        <p class="card" style="text-align:center"><b style="font-size:2rem">$${event.fee}</b><br><span class="muted">Registration fee</span></p>
        <div class="form"><input placeholder="Cardholder Name"><input placeholder="Card Number"><div class="row"><input placeholder="MM/YY"><input placeholder="CVV"></div>
        <button class="btn-primary" id="confirmPay" data-id="${id}">Pay $${event.fee}</button></div>`;
      return;
    }
    state.my.registered.push(id); event.reg += 1; save(); render();
  }

  if(e.target.id === "confirmPay"){
    const id = e.target.dataset.id;
    const event = state.events.find(x=>x.id===id);
    if(!state.my.registered.includes(id)){ state.my.registered.push(id); event.reg += 1; event.revenue += event.fee; }
    modal.classList.add("hidden");
    save(); render();
  }

  if(e.target.id === "createTeamBtn"){
    const name = prompt("Team name?");
    if(!name) return;
    state.teams.push({ id:"t"+Date.now(), name, event:"CodeSprint Hackathon", tags:["New"], members:1, owner:true, code:name.slice(0,4).toUpperCase()+Math.floor(Math.random()*9999) });
    save(); render();
  }

  const copy = e.target.closest(".copy");
  if(copy){ navigator.clipboard.writeText(copy.dataset.code); copy.textContent = "Copied!"; }

  const join = e.target.closest(".join-team");
  if(join){
    if(!state.my.teams.includes(join.dataset.team)) state.my.teams.push(join.dataset.team);
    save(); render();
  }

  const feed = e.target.closest("[data-open-feed]");
  if(feed){
    const ev = state.events.find(x=>x.id===feed.dataset.openFeed);
    modal.classList.remove("hidden");
    modalContent.innerHTML = `<div class="row"><h3>${ev.name} Feed</h3><button id="closeModal" class="ghost">✕</button></div>
      ${state.feed.map(m=>`<div class="list-item">${m}</div>`).join("")}`;
  }
});

document.addEventListener("submit",(e)=>{
  if(e.target.id !== "eventForm") return;
  e.preventDefault();
  const f = new FormData(e.target);
  const event = {
    id: "evt-" + Date.now(),
    name: f.get("name"),
    date: f.get("date"),
    time: f.get("time"),
    venue: f.get("venue"),
    desc: f.get("desc"),
    max: Number(f.get("max") || 50),
    fee: Number(f.get("fee") || 0),
    reg: 0, checkin: 0, revenue: 0
  };
  state.events.push(event);
  state.adminTab = "dashboard";
  save();
  render();
});

show("landing");