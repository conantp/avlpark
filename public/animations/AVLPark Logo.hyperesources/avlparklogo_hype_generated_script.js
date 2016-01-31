//	HYPE.documents["AVLPark Logo"]

(function(){(function k(){function l(a,b,d){var c=!1;null==window[a]&&(null==window[b]?(window[b]=[],window[b].push(k),a=document.getElementsByTagName("head")[0],b=document.createElement("script"),c=h,false==!0&&(c=""),b.type="text/javascript",b.src=c+"/"+d,a.appendChild(b)):window[b].push(k),c=!0);return c}var h="AVLPark%20Logo.hyperesources",c="AVLPark Logo",e="avlparklogo_hype_container";if(false==!1)try{for(var f=document.getElementsByTagName("script"),
a=0;a<f.length;a++){var b=f[a].src;if(null!=b&&-1!=b.indexOf("avlparklogo_hype_generated_script.js")){h=b.substr(0,b.lastIndexOf("/"));break}}}catch(n){}if(false==!1&&(a=navigator.userAgent.match(/MSIE (\d+\.\d+)/),a=parseFloat(a&&a[1])||null,a=l("HYPE_518","HYPE_dtl_518",!0==(null!=a&&10>a||false==!0)?"HYPE-518.full.min.js":"HYPE-518.thin.min.js"),false==!0&&(a=a||l("HYPE_w_518","HYPE_wdtl_518","HYPE-518.waypoints.min.js")),a))return;
f=window.HYPE.documents;if(null!=f[c]){b=1;a=c;do c=""+a+"-"+b++;while(null!=f[c]);for(var d=document.getElementsByTagName("div"),b=!1,a=0;a<d.length;a++)if(d[a].id==e&&null==d[a].getAttribute("HYP_dn")){var b=1,g=e;do e=""+g+"-"+b++;while(null!=document.getElementById(e));d[a].id=e;b=!0;break}if(!1==b)return}b=[];b=[];d={};g={};for(a=0;a<b.length;a++)try{g[b[a].identifier]=b[a].name,d[b[a].name]=eval("(function(){return "+b[a].source+"})();")}catch(m){window.console&&window.console.log(m),
d[b[a].name]=function(){}}a=new HYPE_518(c,e,{"0":{p:1,n:"main-text.svg",g:"21",t:"image/svg+xml"},"1":{p:1,n:"split.svg",g:"23",t:"image/svg+xml"},"2":{p:1,n:"car.svg",g:"27",t:"image/svg+xml"}},h,[],d,[{n:"Untitled Scene",o:"1",X:[0]}],[{o:"3",p:"600px",x:0,a:100,Z:135,cA:false,Y:600,b:100,c:"#FFFFFF",L:[],bY:1,d:600,U:{},T:{kTimelineDefaultIdentifier:{i:"kTimelineDefaultIdentifier",n:"Main Timeline",z:2,b:[],a:[{f:"c",y:0,z:1,i:"a",e:444,s:589,o:"32"},{f:"c",y:1,z:1,i:"e",e:1,s:0,o:"31"},{y:1,i:"a",s:444,z:0,o:"32",f:"c"},{f:"c",p:2,y:2,z:0,i:"ActionHandler",s:{a:[{}]},o:"kTimelineDefaultIdentifier"},{y:2,i:"e",s:1,z:0,o:"31",f:"c"}],f:30}},bZ:180,O:["31","32","30","29"],v:{"29":{x:"visible",tX:0.5,k:"div",c:593,tY:0.5,d:119,z:2,a:3,j:"absolute",bS:375,b:7},"30":{h:"21",p:"no-repeat",x:"visible",a:6,q:"100% 100%",b:4,j:"absolute",bF:"29",c:431,k:"div",z:2,d:99.299999999999997,r:"inline"},"32":{h:"27",p:"no-repeat",x:"visible",a:589,q:"100% 100%",b:4,j:"absolute",bF:"29",c:172.40000000000001,k:"div",z:3,d:87.400000000000006,r:"inline"},"31":{h:"23",p:"no-repeat",x:"visible",a:238,q:"100% 100%",b:80,j:"absolute",bF:"29",z:5,k:"div",c:321.30000000000001,d:39.299999999999997,r:"inline",e:0}}}],{},g,{},
(function (shouldShow, mainContentContainer) {
	var loadingPageID = mainContentContainer.id + "_loading";
	var loadingDiv = document.getElementById(loadingPageID);

	if(shouldShow == true) {
		if(loadingDiv == null) {	
			loadingDiv = document.createElement("div");
			loadingDiv.id = loadingPageID;
			loadingDiv.style.cssText = "overflow:hidden;position:absolute;width:150px;top:40%;left:0;right:0;margin:auto;padding:2px;border:3px solid #BBB;background-color:#EEE;border-radius:10px;text-align:center;font-family:Helvetica,Sans-Serif;font-size:13px;font-weight:700;color:#AAA;z-index:100000;";
			loadingDiv.innerHTML = "Loading";
			mainContentContainer.appendChild(loadingDiv);
		}
 
		loadingDiv.style.display = "block";
		loadingDiv.setAttribute("aria-hidden", false);
		mainContentContainer.setAttribute("aria-busy", true);
	} else {
		loadingDiv.style.display = "none";
		loadingDiv.setAttribute("aria-hidden", true);
		mainContentContainer.removeAttribute("aria-busy");
	}
})

,false,false,-1,true,true,false,true);f[c]=a.API;document.getElementById(e).setAttribute("HYP_dn",
c);a.z_o(this.body)})();})();
