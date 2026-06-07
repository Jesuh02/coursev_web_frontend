const C='coursev-v4',A=['/','index.html','/manifest.json','/descarga.png','/icon-192.png','/icon-512.png','/default-avatar.png','/default-course.png']
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()})
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim()})
self.addEventListener('fetch',e=>{
if(e.request.method!=='GET')return
const u=new URL(e.request.url)
if(u.protocol!=='http:'&&u.protocol!=='https:')return
if(u.origin!==self.location.origin)return
const isNavigate=e.request.mode==='navigate'
const isAsset=/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|css|js)(\?.*)?$/.test(u.pathname)
if(!isNavigate&&isAsset){
e.respondWith(caches.match(e.request).then(cached=>{if(cached)return cached;return fetch(e.request).then(r=>{const ct=r.headers.get('Content-Type')||'';if(r.ok&&r.type==='basic'&&!ct.includes('text/html')){const cl=r.clone();caches.open(C).then(c=>c.put(e.request,cl))}return r}).catch(()=>new Response('',{status:503,statusText:'Service Unavailable'}))}))
return
}
e.respondWith(fetch(e.request).then(r=>{if(r.ok&&r.type==='basic'){const cl=r.clone();caches.open(C).then(c=>c.put(e.request,cl))}return r}).catch(()=>caches.match(e.request).then(cached=>{if(cached)return cached;if(isNavigate){return caches.match('/index.html').then(i=>i||new Response('<!DOCTYPE html><html><body><h1>Offline</h1></body></html>',{status:503,headers:{'Content-Type':'text/html'}}))}return new Response('',{status:503,statusText:'Service Unavailable'})})))
})
self.addEventListener('push',e=>{
if(!e.data)return
let p={}
try{p=e.data.json()}catch{p={title:e.data.text()}}
const t=p.notification?.title??p.title??'Nueva notificación',b=p.notification?.body??p.body??'',d={...(p.data??{}),...(p.notification??{})},ic=d.thumbnailUrl||d.thumbnail_url||'/icon-192.png'
e.waitUntil(self.registration.showNotification(t,{body:b,icon:ic,badge:'/icon-192.png',data:d,tag:d.notificationId?`notif-${d.notificationId}`:undefined}))
})
self.addEventListener('notificationclick',e=>{
e.notification.close()
const d=e.notification.data??{},url=_rurl(d)
e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cl=>{for(const c of cl){if('focus'in c){c.postMessage({type:'NAVIGATE',url});return c.focus()}}if(clients.openWindow)return clients.openWindow(self.location.origin+url)}))
})
function _rurl(d){
const t=String(d.type??d.notifType??''),m=_pm(d.metadata),cId=d.courseId??d.course_id??m?.courseId??m?.course_id,tId=d.taskId??d.task_id??m?.taskId??m?.task_id,vId=d.videoId??d.video_id??m?.videoId??m?.video_id,rId=d.relatedId??d.related_id
switch(t){
case'new_course':case'enrollment_approved':case'collaborator_added':case'course_invitation':if(cId)return`/subjects/${cId}`;if(rId)return`/subjects/${rId}`;break
case'new_task':case'task_submission':case'task_graded':if(tId)return`/task-submission/${tId}`;if(rId)return`/task-submission/${rId}`;break
case'new_video':if(cId)return`/subjects/${cId}`;if(vId)return`/video/${vId}`;if(rId)return`/video/${rId}`;break
case'video_like':case'comment':case'like':case'video_comment':case'comment_reply':case'comment_like':if(vId)return`/video/${vId}`;if(rId)return`/video?openComments=${rId}`;return'/video'
case'enrollment_request':return'/admin?tab=enrollment&subtab=pre'
case'chat_response':return'/chatbot'
}
return'/'
}
function _pm(m){
if(!m)return null
if(typeof m==='object')return m
if(typeof m==='string'){try{let s=m.trim();if(s.startsWith('"')&&s.endsWith('"'))s=s.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,'\\');return s.startsWith('{')?JSON.parse(s):null}catch{return null}}
return null
}
