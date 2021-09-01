"use strict";(self["webpackChunkclipbroad"]=self["webpackChunkclipbroad"]||[]).push([[756],{2756:(e,t,a)=>{a.r(t),a.d(t,{default:()=>z});var i=a(3673),l=a(8880),o=a(2323);const s={class:"col-md-3 relative-position q-py-lg"},n=["src"],c=(0,i._)("div",{class:"col-1 relative-position q-pa-md"},null,-1),r={class:"col relative-position q-pa-md"},u=(0,i._)("div",{class:"col relative-position q-pa-md"},null,-1);function d(e,t,a,d,h,m){const g=(0,i.up)("q-btn"),p=(0,i.up)("q-avatar"),b=(0,i.up)("q-item-section"),k=(0,i.up)("q-item-label"),v=(0,i.up)("q-menu"),w=(0,i.up)("q-item"),q=(0,i.up)("q-toggle"),f=(0,i.up)("q-page"),I=(0,i.Q2)("ripple");return(0,i.wg)(),(0,i.j4)(f,{class:"column q-pa-md"},{default:(0,i.w5)((()=>[(0,i._)("div",s,[(0,i.Wm)(l.uT,{appear:"","enter-active-class":"animated fadeInDown","leave-active-class":"animated fadeOutUp"},{default:(0,i.w5)((()=>[m.showLoginBtn?((0,i.wg)(),(0,i.j4)(g,{key:0,class:"absolute-center q-my-md",color:"primary",icon:"login",label:"Login With Github",onClick:t[0]||(t[0]=e=>m.auth())})):(0,i.kq)("",!0)])),_:1}),(0,i.Wm)(l.uT,{appear:"","enter-active-class":"animated fadeInUp","leave-active-class":"animated fadeOutDown"},{default:(0,i.w5)((()=>[m.showLoginBtn?(0,i.kq)("",!0):(0,i.wy)(((0,i.wg)(),(0,i.j4)(w,{key:0},{default:(0,i.w5)((()=>[""!=m.avatarUrl?((0,i.wg)(),(0,i.j4)(b,{key:0,side:""},{default:(0,i.w5)((()=>[(0,i.Wm)(p,{rounded:"",size:"48px"},{default:(0,i.w5)((()=>[(0,i._)("img",{src:m.avatarUrl},null,8,n)])),_:1})])),_:1})):(0,i.kq)("",!0),(0,i.Wm)(b,null,{default:(0,i.w5)((()=>[""!=m.username?((0,i.wg)(),(0,i.j4)(k,{key:0},{default:(0,i.w5)((()=>[(0,i.Uk)((0,o.zw)(m.username),1)])),_:1})):(0,i.kq)("",!0),m.rateLimit?((0,i.wg)(),(0,i.j4)(k,{key:1,caption:""},{default:(0,i.w5)((()=>[(0,i.Uk)((0,o.zw)("Limit: "+m.rateLimit.current+" / "+m.rateLimit.limit),1)])),_:1})):(0,i.kq)("",!0),m.rateLimit?((0,i.wg)(),(0,i.j4)(k,{key:2,caption:""},{default:(0,i.w5)((()=>[(0,i.Uk)((0,o.zw)("Reset in: "+m.rateLimit.time+"s"),1)])),_:1})):(0,i.kq)("",!0)])),_:1}),(0,i.Wm)(v,{anchor:"center middle",self:"center middle"},{default:(0,i.w5)((()=>[(0,i.Wm)(g,{color:"black",label:"Logout",onClick:t[1]||(t[1]=e=>m.logout())})])),_:1})])),_:1},512)),[[I]])])),_:1})]),c,(0,i._)("div",r,[e.$q.platform.is.mac?((0,i.wg)(),(0,i.j4)(q,{key:0,modelValue:h.hideIcon,"onUpdate:modelValue":t[2]||(t[2]=e=>h.hideIcon=e),"checked-icon":"check",class:"absolute-center q-my-md",color:"green","unchecked-icon":"clear",label:"Hide Dock Icon","left-label":""},null,8,["modelValue"])):(0,i.kq)("",!0)]),u])),_:1})}var h=a(3437),m=a(1185),g=a(1959),p=a(19);const b="fa79756f53d8c0a88ddd";let k=null,v=!1,w=(0,g.iH)(!1),q=(0,g.iH)(""),f=(0,g.iH)(""),I=(0,g.iH)(null);const $={data(){return{hideIcon:!0}},computed:{showLoginBtn(){return!w.value},username(){return q.value},avatarUrl(){return f.value},rateLimit(){return I.value}},methods:{auth(){let e=(0,m.Z)();this.$q.localStorage.set("clipbroad-github-state",e),(0,h.Z)(`https://github.com/login/oauth/authorize?client_id=${b}&redirect_uri=https://logiconsole.com/api/clipbroad/oauth&scope=repo&state=${e}`,null,{noreferrer:!1}),v=!0},logout(){this.$q.localStorage.remove("clipbroad-github-token"),this.$githubInstance.github=null,this.$githubInstance.githubUser=null,this.$githubInstance.githubRepo=null,this.$githubInstance.githubUserName=null,this.$githubInstance.githubAvatarUrl=null,this.$githubInstance.rateLimit=null,this.$githubInstance.githubRepoExist=!1,w.value=!1},setToken(e){w.value=!0,v=!1,this.$setGithub(e).then((({data:e})=>{q.value=e.username,f.value=e.avatarUrl})).catch((()=>{}))}},mounted(){this.$q.localStorage.has("clipbroad-github-token")&&this.setToken(this.$q.localStorage.getItem("clipbroad-github-token")),v=!1,null==k&&(k=setInterval((()=>{v&&this.$axios.post("https://api.logictan.workers.dev/corsproxy/",{state:this.$q.localStorage.getItem("clipbroad-github-state")}).then((({data:e})=>{"success"!=e.status?p.log(e.message):(p.log(`access token is ${e.message}`),this.$q.localStorage.set("clipbroad-github-token",e.message),this.setToken(e.message))})).catch((e=>{p.log(e)}))}),2e3)),this.$getRateLimit().then((({message:e})=>{I.value=e})).catch((e=>{}))},watch:{hideIcon:function(e){this.$q.localStorage.set("clipbroad-hide-icon",e),this.$q.platform.is.electron&&window.myAPI.setHideIcon(e)}},created(){this.hideIcon=!this.$q.localStorage.has("clipbroad-hide-icon")||this.$q.localStorage.getItem("clipbroad-hide-icon"),this.$q.platform.is.electron&&window.myAPI.setHideIcon(this.hideIcon)}};var _=a(4379),y=a(4607),L=a(3414),U=a(2035),Z=a(5096),S=a(2350),Q=a(1634),j=a(4904),H=a(6489),W=a(9789),T=a.n(W);$.render=d;const z=$;T()($,"components",{QPage:_.Z,QBtn:y.Z,QItem:L.Z,QItemSection:U.Z,QAvatar:Z.Z,QItemLabel:S.Z,QMenu:Q.Z,QToggle:j.Z}),T()($,"directives",{Ripple:H.Z})}}]);