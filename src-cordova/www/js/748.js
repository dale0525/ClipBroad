"use strict";(self["webpackChunkclipbroad"]=self["webpackChunkclipbroad"]||[]).push([[748],{7748:(e,t,a)=>{a.r(t),a.d(t,{default:()=>X});var l=a(3673),o=a(8880),i=a(2323);const c={class:"col-3 q-py-md"},n=["src"],s={class:"col-1 q-py-md",style:{width:"100%"}},r={class:"col-6 q-pa-md items-center"},u={class:"col-1 q-py-md",style:{width:"100%"}},d={class:"col q-pa-md items-center"},h={class:"q-pa-md"},m={class:"q-pa-md"},p=(0,l.Uk)(" Github "),g=(0,l.Uk)(" Blog "),b={class:"q-pa-md"},w=(0,l.Uk)(" Paypal "),k=(0,l.Uk)(" Wechat "),q=(0,l.Uk)(" Alipay ");function f(e,t,a,f,$,v){const y=(0,l.up)("q-btn"),I=(0,l.up)("q-avatar"),_=(0,l.up)("q-item-section"),U=(0,l.up)("q-item-label"),x=(0,l.up)("q-menu"),S=(0,l.up)("q-item"),L=(0,l.up)("q-separator"),W=(0,l.up)("q-toggle"),Z=(0,l.up)("q-tooltip"),Q=(0,l.up)("q-select"),C=(0,l.up)("q-badge"),V=(0,l.up)("q-chip"),j=(0,l.up)("q-img"),z=(0,l.up)("q-banner"),B=(0,l.up)("q-popup-proxy"),A=(0,l.up)("q-page"),P=(0,l.Q2)("ripple");return(0,l.wg)(),(0,l.j4)(A,{class:"column q-pa-md items-center"},{default:(0,l.w5)((()=>[(0,l._)("div",c,[(0,l.Wm)(o.uT,{appear:"","enter-active-class":"animated fadeInDown","leave-active-class":"animated fadeOutUp"},{default:(0,l.w5)((()=>[v.showLoginBtn?((0,l.wg)(),(0,l.j4)(y,{key:0,color:"primary",icon:"login",label:e.$t("githubLogin"),onClick:t[0]||(t[0]=e=>v.auth())},null,8,["label"])):(0,l.kq)("",!0)])),_:1}),(0,l.Wm)(o.uT,{appear:"","enter-active-class":"animated fadeInUp","leave-active-class":"animated fadeOutDown"},{default:(0,l.w5)((()=>[v.showLoginBtn?(0,l.kq)("",!0):(0,l.wy)(((0,l.wg)(),(0,l.j4)(S,{key:0},{default:(0,l.w5)((()=>[""!=v.avatarUrl?((0,l.wg)(),(0,l.j4)(_,{key:0,side:""},{default:(0,l.w5)((()=>[(0,l.Wm)(I,{rounded:"",size:"48px"},{default:(0,l.w5)((()=>[(0,l._)("img",{src:v.avatarUrl},null,8,n)])),_:1})])),_:1})):(0,l.kq)("",!0),(0,l.Wm)(_,null,{default:(0,l.w5)((()=>[""!=v.username?((0,l.wg)(),(0,l.j4)(U,{key:0},{default:(0,l.w5)((()=>[(0,l.Uk)((0,i.zw)(v.username),1)])),_:1})):(0,l.kq)("",!0),v.rateLimit?((0,l.wg)(),(0,l.j4)(U,{key:1,caption:""},{default:(0,l.w5)((()=>[(0,l.Uk)((0,i.zw)(e.$t("githubAPILimit")+v.rateLimit.current+" / "+v.rateLimit.limit),1)])),_:1})):(0,l.kq)("",!0),v.rateLimit?((0,l.wg)(),(0,l.j4)(U,{key:2,caption:""},{default:(0,l.w5)((()=>[(0,l.Uk)((0,i.zw)(e.$t("githubAPIReset")+v.rateLimit.time+"s"),1)])),_:1})):(0,l.kq)("",!0)])),_:1}),(0,l.Wm)(x,{anchor:"center middle",self:"center middle"},{default:(0,l.w5)((()=>[(0,l.Wm)(y,{color:"black",label:"Logout",onClick:t[1]||(t[1]=e=>v.logout())})])),_:1})])),_:1},512)),[[P]])])),_:1})]),(0,l._)("div",s,[(0,l.Wm)(L)]),(0,l._)("div",r,[(0,l._)("div",null,[e.$q.platform.is.mac?((0,l.wg)(),(0,l.j4)(W,{key:0,modelValue:$.hideIcon,"onUpdate:modelValue":t[2]||(t[2]=e=>$.hideIcon=e),"checked-icon":"check",color:"green","unchecked-icon":"clear",label:e.$t("hideDockIcon"),"left-label":""},null,8,["modelValue","label"])):(0,l.kq)("",!0)]),(0,l._)("div",null,[e.$q.platform.is.electron?((0,l.wg)(),(0,l.j4)(W,{key:0,modelValue:$.autoLaunch,"onUpdate:modelValue":t[3]||(t[3]=e=>$.autoLaunch=e),"checked-icon":"check",color:"green","unchecked-icon":"clear",label:e.$t("launchWithSystem"),"left-label":"",class:"q-mb-md"},null,8,["modelValue","label"])):(0,l.kq)("",!0)]),(0,l._)("div",null,[e.$q.platform.is.electron?((0,l.wg)(),(0,l.j4)(W,{key:0,modelValue:$.showCopiedNotification,"onUpdate:modelValue":t[4]||(t[4]=e=>$.showCopiedNotification=e),"checked-icon":"check",color:"green","unchecked-icon":"clear",label:e.$t("copyNotification"),"left-label":"",class:"q-mb-md"},null,8,["modelValue","label"])):(0,l.kq)("",!0)]),(0,l._)("div",null,[e.$q.platform.is.cordova?((0,l.wg)(),(0,l.j4)(W,{key:0,modelValue:$.syncUseMobileData,"onUpdate:modelValue":t[5]||(t[5]=e=>$.syncUseMobileData=e),"checked-icon":"check",color:"green","unchecked-icon":"clear",label:e.$t("useCellular"),"left-label":"",class:"q-mb-md"},null,8,["modelValue","label"])):(0,l.kq)("",!0)]),(0,l._)("div",null,[(0,l.Wm)(Q,{label:e.$t("maxItem"),"transition-show":"jump-up","transition-hide":"jump-up",filled:"",modelValue:$.maxItem,"onUpdate:modelValue":t[6]||(t[6]=e=>$.maxItem=e),options:[20,40,60,80,100],style:{width:"250px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(Z,{anchor:"top middle",self:"bottom middle",offset:[10,10]},{default:(0,l.w5)((()=>[(0,l.Uk)((0,i.zw)(e.$t("maxItemTip")),1)])),_:1})])),_:1},8,["label","modelValue"])])]),(0,l._)("div",u,[(0,l.Wm)(L)]),(0,l._)("div",d,[(0,l._)("div",h,[(0,l.Uk)((0,i.zw)(e.$t("version"))+" ",1),(0,l.Wm)(C,{color:"primary"},{default:(0,l.w5)((()=>[(0,l.Uk)((0,i.zw)($.version),1)])),_:1})]),(0,l._)("div",m,[(0,l.Uk)((0,i.zw)(e.$t("link"))+" ",1),(0,l.Wm)(V,{clickable:"",onClick:t[7]||(t[7]=e=>v.openExternalURL("https://github.com/dale0525/ClipBroad")),color:"grey-10","text-color":"white"},{default:(0,l.w5)((()=>[p])),_:1}),(0,l.Wm)(V,{clickable:"",onClick:t[8]||(t[8]=e=>v.openExternalURL("https://www.logiconsole.com")),color:"black","text-color":"white"},{default:(0,l.w5)((()=>[g])),_:1})]),(0,l._)("div",b,[(0,l.Uk)((0,i.zw)(e.$t("donation"))+" ",1),(0,l.Wm)(V,{clickable:"",onClick:t[9]||(t[9]=e=>v.openExternalURL("https://paypal.me/logictan")),color:"indigo-10","text-color":"white",icon:"paypal"},{default:(0,l.w5)((()=>[w])),_:1}),(0,l.Wm)(V,{color:"green","text-color":"white",icon:"wechat"},{default:(0,l.w5)((()=>[k,(0,l.Wm)(B,null,{default:(0,l.w5)((()=>[(0,l.Wm)(z,{style:{width:"250px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(j,{src:"https://github.com/dale0525/ClipBroad/blob/main/screenshot/donation_wechat.png?raw=true","spinner-color":"primary",style:{"max-width":"250px"}})])),_:1})])),_:1})])),_:1}),(0,l.Wm)(V,{color:"blue-7","text-color":"white"},{default:(0,l.w5)((()=>[q,(0,l.Wm)(B,null,{default:(0,l.w5)((()=>[(0,l.Wm)(z,{style:{width:"250px"}},{default:(0,l.w5)((()=>[(0,l.Wm)(j,{src:"https://github.com/dale0525/ClipBroad/blob/main/screenshot/donation_alipay.png?raw=true","spinner-color":"primary",style:{"max-width":"250px"}})])),_:1})])),_:1})])),_:1})])])])),_:1})}var $=a(3437),v=a(1185),y=a(1959),I=a(19);const _="fa79756f53d8c0a88ddd";let U=null,x=!1,S=(0,y.iH)(!1),L=(0,y.iH)(""),W=(0,y.iH)(""),Z=(0,y.iH)(null);const Q={data(){return{hideIcon:!!this.$q.localStorage.has("clipbroad-hide-icon")&&this.$q.localStorage.getItem("clipbroad-hide-icon"),autoLaunch:!!this.$q.localStorage.has("clipbroad-auto-launch")&&this.$q.localStorage.getItem("clipbroad-auto-launch"),showCopiedNotification:!this.$q.localStorage.has("clipbroad-show-copied-notification")||this.$q.localStorage.getItem("clipbroad-show-copied-notification"),syncUseMobileData:!!this.$q.localStorage.has("clipbroad-use-mobile-data")&&this.$q.localStorage.getItem("clipbroad-use-mobile-data"),maxItem:this.$q.localStorage.has("clipbroad-max-item")?this.$q.localStorage.getItem("clipbroad-max-item"):40,version:"0.2.0"}},computed:{showLoginBtn(){return!S.value},username(){return L.value},avatarUrl(){return W.value},rateLimit(){return Z.value}},methods:{auth(){let e=(0,v.Z)();this.$q.localStorage.set("clipbroad-github-state",e),(0,$.Z)(`https://github.com/login/oauth/authorize?client_id=${_}&redirect_uri=https://logiconsole.com/api/clipbroad/oauth&scope=repo&state=${e}`),x=!0},logout(){this.$q.localStorage.remove("clipbroad-github-token"),this.$githubInstance.github=null,this.$githubInstance.githubUser=null,this.$githubInstance.githubRepo=null,this.$githubInstance.githubUserName=null,this.$githubInstance.githubAvatarUrl=null,this.$githubInstance.rateLimit=null,this.$githubInstance.githubRepoExist=!1,S.value=!1},setToken(e){S.value=!0,x=!1,this.$setGithub(e).then((({data:e})=>{L.value=e.username,W.value=e.avatarUrl})).catch((()=>{}))},openExternalURL(e){(0,$.Z)(e,null,{noopener:!0,menubar:!0,toolbar:!0,noreferrer:!0})}},mounted(){this.$q.localStorage.has("clipbroad-github-token")&&this.setToken(this.$q.localStorage.getItem("clipbroad-github-token")),x=!1,null==U&&(U=setInterval((()=>{x&&this.$axios.post("https://api.logictan.workers.dev/corsproxy/",{state:this.$q.localStorage.getItem("clipbroad-github-state")}).then((({data:e})=>{"success"!=e.status||(this.$q.localStorage.set("clipbroad-github-token",e.message),this.setToken(e.message))})).catch((e=>{I.log(e)}))}),2e3)),this.$getRateLimit().then((({message:e})=>{Z.value=e})).catch((e=>{}))},watch:{hideIcon:function(e){this.$q.localStorage.set("clipbroad-hide-icon",e),this.$q.platform.is.mac&&window.myAPI.setHideIcon(e)},autoLaunch:function(e){this.$q.localStorage.set("clipbroad-auto-launch",e),this.$q.platform.is.electron&&window.myAPI.registerAutoLaunch(e)},showCopiedNotification:function(e){this.$q.localStorage.set("clipbroad-show-copied-notification",e)},syncUseMobileData:function(e){this.$q.localStorage.set("clipbroad-use-mobile-data",e)},maxItem:function(e){this.$q.localStorage.set("clipbroad-max-item",e)}},created(){this.hideIcon=!this.$q.localStorage.has("clipbroad-hide-icon")||this.$q.localStorage.getItem("clipbroad-hide-icon"),this.$q.platform.is.electron&&window.myAPI.setHideIcon(this.hideIcon)}};var C=a(4379),V=a(4607),j=a(3414),z=a(2035),B=a(5096),A=a(2350),P=a(811),R=a(5869),T=a(8886),D=a(2021),H=a(8870),N=a(9721),E=a(7030),M=a(3944),G=a(5607),O=a(4027),F=a(6489),J=a(9789),K=a.n(J);Q.render=f;const X=Q;K()(Q,"components",{QPage:C.Z,QBtn:V.Z,QItem:j.Z,QItemSection:z.Z,QAvatar:B.Z,QItemLabel:A.Z,QMenu:P.Z,QSeparator:R.Z,QToggle:T.Z,QSelect:D.Z,QTooltip:H.Z,QBadge:N.Z,QChip:E.Z,QPopupProxy:M.Z,QBanner:G.Z,QImg:O.Z}),K()(Q,"directives",{Ripple:F.Z})}}]);