var $ = function( id ) { return document.getElementById( id ); };
var countrySelect;
var occupationSelect;
var data2Countries = ["USA", "Canada"];
var firstLoad = true;
var restoreScrollbarsTimeout = null;
var activeBox = null;
var touchStartY = 0;

function loadDataForSelect(selectElement, dataset, type, list){
	dataset.forEach(x => {
		if(x[type] != "" && !list.includes(x[type])){
            if((type == "Occupation" && x["Country"].split(";").includes(countrySelect.value)) || type != "Occupation") list.push(x[type]);
		}
	});
    
	list.forEach(x => {
        var opt = document.createElement("option");
        opt.value = x;
        opt.innerHTML = x;
        selectElement.appendChild(opt);
    });
}

function resetPage(){
    if(location.hash == "" || location.hash == "#"){
        countrySelect.value = "";
        geoAutoSelect();
    }
    
    occupationSelect.value = "";
    $("form1").reset();
    $("form2").reset();
}

function onPageShow(){
    resetPage();
}

function showBox(box){
    activeBox = box;
    box.style.display = "revert";
}

function geoAutoSelect(){
    var country;
    /*
    // Geo IP
    fetch('https://ipapi.co/json/')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    var country = data.country_name;
  });*/
  
    // Browser locale
    var locale = new Intl.DateTimeFormat().resolvedOptions().locale;
    if(locale.includes("-")){
        var browserCountryCode = locale.split('-')[1];
        var regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
        country = regionNames.of(browserCountryCode);
        if(country == "United States") country = "USA";
        // country = "test";
        if(checkHaveDataForCountry(country)){
            countrySelect.value = country;
            changedCountry();
        }else{
            showBox($("box1"));
        }
    }
}

function onload(){
	countrySelect = $("countrySelect");
    // loadDataForSelect(countrySelect, union_data, "Country", [...data2Countries]);
    loadDataForSelect(countrySelect, union_data, "Country", []);
	occupationSelect = $("occupationSelect");
	countrySelect.addEventListener("change", changedCountry);
	occupationSelect.addEventListener("change", changedOccupation);
	$("form1").addEventListener("change", form1_change);
	$("box2_backButton").addEventListener("click", box2_backButton_Click);
	$("box3_backButton").addEventListener("click", box3_backButton_Click);
	$("form2").addEventListener("change", form2_change);
	/*$("btnHowJoinApprenticeship").addEventListener("click", btnHowJoinApprenticeship_Click);
	$("btnShowApprenticeshipList").addEventListener("click", btnShowApprenticeshipList_Click);*/
    addEventListener('hashchange', onHashChange);
    addEventListener('pageshow', onPageShow);
    
    addEventListener('wheel', scrollHandler);
    addEventListener('keydown', scrollHandler);
    addEventListener('touchstart', touchStartHandler);
    addEventListener('touchmove', scrollHandler);
    
    if(location.hash != ""){
        var country = location.hash.split("#")[1];
        if(checkHaveDataForCountry(country)){
            countrySelect.value = country;
            changedCountry();
        }else{
            geoAutoSelect();
        }
    }
}

function onAllLoad(){
    document.body.classList.remove("no-transition");
}

function changedCountry(){
	// $("box1_intro").style.display = "none";
    // $("box2_countryLabel").innerHTML = countrySelect.value;
    //$("box2_countryLabel2").innerHTML = countrySelect.value;
    
    if(data2Countries.includes(countrySelect.value)){
        $("box1").style.display = "none";
        $("box2").style.display = "none";
        showBox($("box3"));
        if(!firstLoad) $("box3").classList.add("animate-opacity");
        $("box3").scrollIntoView({behavior: "smooth"});
        $("box3_countryLabel").appendChild(countrySelect);
        resetBox3();
    }else if(countrySelect.value != ""){
        if(union_data.some(obj => obj.Country === countrySelect.value)){
            $("box1").style.display = "none";
           //  $("box2").classList.remove("animate-opacity");
            $("box3").style.display = "none";
            showBox($("box2"));
            // $("box1_intro").classList.add("animate-opacityR");
            genUnionTable(union_data, $("unionTable"), false);
            if(!firstLoad) $("box2").classList.add("animate-opacity");
            $("box2").scrollIntoView({behavior: "smooth"});
            $("box2_countryLabel").appendChild(countrySelect);
        }else{
            showBox($("box1"));
            // $("countryDataNotFoundBox").style.display = "revert"; // Commented out bc maybe country detection is wrong
        }
    }
    
    // location.hash = countrySelect.value;
}

function checkHaveDataForCountry(country){
    return data2Countries.includes(country) || union_data.some(obj => obj.Country === country);
}

function genUnionTable(dataset, whichTable, matchOccupation, matchApprenticeships = false){
        var ret = 0;
        whichTable.innerHTML = "";
        dataset.forEach(union => {
            var pass = false;
            union.Country.split(";").forEach(country => {if(country == countrySelect.value) pass = true;});
            if(matchOccupation && union.Occupation != occupationSelect.value) pass = false;
            if(matchApprenticeships && union.Apprenticeships != "Yes") pass = false;
            
            if(pass){
                var tr = document.createElement("tr");
                var td = document.createElement("td");
                var img = document.createElement("img");
                img.src = "img/union-logos/" + union.Image;
                var span = document.createElement("span");
                span.className = "unionAcronym";
                span.innerHTML = "<br>" + union.Union;
                td.appendChild(img);
                td.appendChild(span);
                tr.appendChild(td);
                /*var td = document.createElement("td");
                td.innerHTML = union.Union;
                td.className = "unionAcronym";
                tr.appendChild(td);*/
                var td = document.createElement("td");
                td.className = "unionName";
                var p = document.createElement("p");
                p.innerHTML = union["Full name"];
                p.appendChild(document.createElement("br"));
                var a = document.createElement("a");
                a.innerHTML = "Read more";
                a.href = union["Link"];
                a.target = "_blank";
                a.addEventListener("click", onClickJoinLink);
                p.appendChild(a);
                td.appendChild(p);
                tr.appendChild(td);
                if(union["Join link"] != ""){
                    var td = document.createElement("td");
                    var a = document.createElement("a");
                    a.href = union["Join link"];
                    if(matchApprenticeships && union["Apprenticeship link"] != ""){
                        a.href = union["Apprenticeship link"];
                    }
                    a.target = "_blank";
                    /*var link1 = document.createElement("link");
                    link1.rel = "prefetch";
                    link1.href = a.href;
                    link1.as = "document";
                    document.head.appendChild(link1);*/
                    var btn = document.createElement("button");
                    btn.className = "myButton1 joinUnionBtn";
                    btn.innerHTML = "<span>➡️<br />Join!</span>";
                    a.addEventListener("click", onClickJoinLink);
                    a.appendChild(btn);
                    // btn.addEventListener("click", onClickJoinLink);
                    td.appendChild(a);
                    tr.appendChild(td);
                }
                
                whichTable.appendChild(tr);
                
                if(ret != 2 && matchOccupation && union["Direct join"] == "Yes"){
                    ret = 1;
                }
                
                if(matchOccupation && union["Apprenticeships"] == "Yes"){
                    ret = 2;
                }
            }
        });
        
        return ret;
}

function onClickJoinLink(e){
    // this.classList.add("loading-button");
    e.preventDefault();
    var newTab = window.open();
    var html = `
      <html>
        <head>
          <title>Join a Union</title>
          <script>
              function onload(){
                var link = "` + this.href + `";
                location.href = link;
                /*var iframe = document.createElement("iframe");
                iframe.src = link;
                document.body.appendChild(iframe);
                iframeError = setTimeout(error, 5000);

                iframe.onload = function() {
                  location.href = link;
                };

                iframe.onerror = function() {
                  location.href = link;
                };*/
              }
            window.addEventListener("load", onload);
          </script>
        </head>
        <body>
          <div class="loading-screen">
  <div class="loading-spinner"></div>
</div>

<style>
  .loading-screen {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    z-index: 9999;
  }

  .loading-spinner {
    border: 16px solid #f3f3f3;
    border-top: 16px solid #3498db;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 3s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
        </body>
      </html>
    `;
    newTab.document.write(html);
    newTab.document.close();
}

function changedOccupation(){
	if(occupationSelect.value != ""){
        hideChildBox($("box3_1"));
        showChildBox($("box3_2"));
        // $("box3_2_front").appendChild(countrySelect);
        appendChildConditional($("box3_2_front"), $("radio1n_info"));
        // restoreScrollbars($("box3"));
        //$("box3_1").style.display = "none";
        $("box3_2").style.display = "revert";
        var unionTable = $("unionTable");
        $("radio1n_info2").style.display = "revert";
        $("radio1n_info2_1").style.display = "none";
        $("radio1n_info2_2").style.display = "none";
        $("radio1n_info2_3").style.display = "none";
        $("radio1n_info2_4").style.display = "none";
        var ret = genUnionTable(union_data2, $("box3_unionTable"), true);
        $("box3_unionTable").style.display = "revert";
        $("box3_unionTable").classList.add("animate-opacity");
        if(occupationSelect.value == "Other"){
            $("radio1n_info2_4").style.display = "revert";
            $("radio1n_info2_4").classList.add("animate-opacity");
        }else if(ret == 1){
            $("radio1n_info2_1").style.display = "revert";
            $("radio1n_info2_1").classList.add("animate-opacity");
        }else if(ret == 2){
            $("radio1n_info2_3").style.display = "revert";
            $("radio1n_info2_3").classList.add("animate-opacity");
        }else{
            $("radio1n_info2_2").style.display = "revert";
            $("radio1n_info2_2").classList.add("animate-opacity");
        }

        // $("radio1n_info2").scrollIntoView({behavior: "smooth"})
	}
}

function form1_change(){
    $("radio1n_info2").style.display = "none";
    $("box3_unionTable").style.display = "none";
    $("text_HowApplyApprenticeship").style.display = "none";
    hideChildBox($("box3_2"));
    showChildBox($("box3_1"));

    if($("radio1y").checked){
        $("box3_unionTable").style.display = "none";
        $("radio1y_info").style.display = "revert";
        $("radio1y_info").classList.add("animate-opacity");
        $("radio1y_info").scrollIntoView({behavior: "smooth"});
    }else{
        $("radio1y_info").style.display = "none";
    }
    
    if($("radio1n").checked){
        $("radio1n_info").style.display = "revert";
        $("radio1n_info").classList.add("animate-opacity");
        $("radio1n_info").scrollIntoView({behavior: "smooth"});
        occupationSelect.value = "";
        occupationSelect.innerHTML = "<option></option>";
        loadDataForSelect(occupationSelect, union_data2, "Occupation", []);
    }else{
        $("radio1n_info").style.display = "none";
    }
    
    if($("radio1nojob").checked){
        //$("box3_1").style.display = "none";
        //$("box3_2").style.display = "revert";
        $("form2").reset();
        hideChildBox($("box3_1"));
        showChildBox($("box3_2"));
        appendChildConditional($("box3_2_front"), $("form1"));
        $("radio1nojob_info").style.display = "revert";
        $("radio1nojob_info").classList.add("animate-opacity");
        /*$("box3_unionTable").style.display = "revert";
        $("box3_unionTable").classList.add("animate-opacity");*/
        genUnionTable(union_data2, $("box3_unionTable"), false, true);
        //$("radio1nojob_info").scrollIntoView({behavior: "smooth"});
    }else{
        $("radio1nojob_info").style.display = "none";
        appendChildConditional($("box3_formContainer"), $("form1"));
    }
}

function form2_change(){
    $("box3_unionTable").style.display = "none";
    $("text_HowApplyApprenticeship").style.display = "none";
    
    if($("radioHowJoinApprenticeship").checked){
        if($("text_HowApplyApprenticeship").style.display == "none"){
            $("text_HowApplyApprenticeship").style.display = "revert";
            $("text_HowApplyApprenticeship").classList.add("animate-opacity");
            $("text_HowApplyApprenticeship").scrollIntoView({behavior: "smooth"});
        }
    }else if($("radioShowApprenticeshipList").checked){
        if($("box3_unionTable").style.display == "none"){
            $("box3_unionTable").style.display = "revert";
            $("box3_unionTable").classList.add("animate-opacity");
            restoreScrollbars($("box3"));
            $("box3_unionTable").scrollIntoView({behavior: "smooth"});
        }
    }
}

function showChildBox(box, skipTransition){
    if(box.classList.contains("boxChild_hide") || box.style.display == "none"){
        box.classList.remove("boxChild_hide");
        box.style.display = "revert";
        if(skipTransition){
            box.classList.add("boxChild_active");
        }else{
           setTimeout(() => {
            box.classList.add("boxChild_active");
            }, 50);
        }
    }
}

function restoreScrollbars(box){
    box.classList.remove("hideScrollbars");
}

function hideChildBox(box){
    if(box.classList.contains("boxChild_active") || box.style.display != "none"){
        $("box3").classList.add("hideScrollbars");
        box.classList.remove("boxChild_active");
        box.classList.add("boxChild_hide");
        if(restoreScrollbarsTimeout != null) window.clearTimeout(restoreScrollbarsTimeout);
            restoreScrollbarsTimeout = setTimeout(() => {
                restoreScrollbars($("box3"));
            }, 1000);
       setTimeout(() => {
        box.style.display = "none";
        }, 1000);
    }
}

function box2_backButton_Click(){
    $("box2").style.display = "none";
    showBox($("box1"));
    $("box1").classList.add("animate-opacity");
    countrySelect.value = "";
    location.hash = "";
    $("box1_countrySelectHolder").appendChild(countrySelect);
}

function box3_backButton_Click(){
    if($("box3_2").classList.contains("boxChild_active")){
        // Go back to box3_1. (see resetBox3 later)
        $("box3_countryLabel").appendChild(countrySelect);
        appendChildConditional($("box3_formContainer"), $("form1"));
    }else{
        // Go back to box1.
        countrySelect.value = "";
        location.hash = "";
        $("box3").style.display = "none";
        showBox($("box1"));
        $("box1").classList.add("animate-opacity");
        $("box1_countrySelectHolder").appendChild(countrySelect);
    }
    
    resetBox3();
}

function appendChildConditional(par, child){
    if (!par.contains(child)) {
      par.appendChild(child);
    }
}
function resetBox3(dontResetForm){
    occupationSelect.value = "";
    appendChildConditional($("box3_1"), $("radio1n_info"));
    if(!dontResetForm) $("form1").reset();
    $("radio1y_info").style.display = "none";
    $("radio1n_info").style.display = "none";
    $("radio1n_info2").style.display = "none";
    $("radio1nojob_info").style.display = "none";
    $("box3_unionTable").style.display = "none";
    $("text_HowApplyApprenticeship").style.display = "none";
    showChildBox($("box3_1"));
    hideChildBox($("box3_2"));
}

function btnHowJoinApprenticeship_Click(){
    if($("text_HowApplyApprenticeship").style.display == "none"){
        $("text_HowApplyApprenticeship").style.display = "revert";
        $("text_HowApplyApprenticeship").classList.add("animate-opacity");
    }else{
        $("text_HowApplyApprenticeship").style.display = "none";
    }
}

function btnShowApprenticeshipList_Click(){
    if($("box3_unionTable").style.display == "none"){
        $("box3_unionTable").style.display = "revert";
        $("box3_unionTable").classList.add("animate-opacity");
        restoreScrollbars($("box3"));
    }else{
        $("box3_unionTable").style.display = "none";
    }
}

function onHashChange(){
    if(location.hash == ""){
        if($("box2").style.display != "none") box2_backButton_Click();
        if($("box3").style.display != "none") box3_backButton_Click();
    }
}

function touchStartHandler(event) {
    touchStartY = event.touches[0].clientY;
}

// Event handler function for scrolling
function scrollHandler(event) {
    if (activeBox != null && touchStartY != null) {
        target = false;
        if (event.target === document || event.target === window || event.target === document.body || event.target === document.documentElement) target = true;
        // console.log(event.target);

        // Prevent the default behavior of the event (e.g. scrolling the page)
        // event.preventDefault();

        // Determine the amount to scroll based on the event type
        var deltaY = 0;
        switch (event.type) {
            case 'wheel':
                if (target) {
                    deltaY = event.deltaY;
                }
                break;
            case 'keydown':
                /*// console.log(document.activeElement);
                if(document.activeElement != activeBox){
                  if (event.keyCode === 38) { // Up arrow
                    deltaY = -10;
                  } else if (event.keyCode === 40) { // Down arrow
                    deltaY = 10;
                  }
                }*/
                break;
            case 'touchmove':
                if (target) {
                    if (event.touches.length == 1) {
                        deltaY = (touchStartY - event.touches[0].clientY) / 8;
                    }
                }
                break;
        }

        // console.log(deltaY != 0);

        // Scroll the element by the determined amount
        activeBox.scrollTop += deltaY;
    }
}

addEventListener("DOMContentLoaded", onload);
addEventListener("load", onAllLoad);

union_data = [
  {
    "Country": "Argentina",
    "Union": "CTA",
    "Full name": "Central de Trabajadores de la Argentina",
    "Link": "https://www.cta.org.ar/",
    "Join link": "https://www.cta.org.ar/ficha-de-afiliacion.html",
    "SourceImage": "https://www.cta.org.ar/IMG/ctatlogo.jpg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_31.webp"
  },
  {
    "Country": "Argentina",
    "Union": "CTA-A",
    "Full name": "Central de Trabajadores de la Argentina Autónoma",
    "Link": "https://ctaa.org.ar/",
    "Join link": "https://ctaa.org.ar/ficha-de-afiliacion/",
    "SourceImage": "https://ctaa.org.ar/wp-content/uploads/2021/02/logo-CTA.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_32.webp"
  },
  {
    "Country": "Australia",
    "Union": "ACTU",
    "Full name": "Australian Council of Trade Unions",
    "Link": "https://www.actu.org.au/",
    "Join link": "https://www.australianunions.org.au/join/begin-join",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Australian_Council_of_Trade_Unions_logo.svg/1200px-Australian_Council_of_Trade_Unions_logo.svg.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_2.webp"
  },
  {
    "Country": "Austria",
    "Union": "OGB",
    "Full name": "Österreichischer Gewerkschaftsbund",
    "Link": "https://www.oegb.at/",
    "Join link": "https://secure.gewerkschaft.at/OEGB/V04/",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/c/c1/%C3%96sterreichischer_Gewerkschaftsbund_logo.svg",
    "Site lang": "",
    "Membership conditions link": "https://www.oegb.at/mitglied-werden",
    "": "",
    "Image": "1_3.svg"
  },
  {
    "Country": "Basque Country",
    "Union": "ELA",
    "Full name": "Eusko Langileen Alkartasuna",
    "Link": "https://www.ela.eus/eu?set_language=eu",
    "Join link": "https://ela.eus/afiliazioa/afiliazioa.nsf/afiliatu?OpenForm&Hizkuntza=Euskara",
    "SourceImage": "https://www.ela.eus/@@site-logo/ELA_logo_koloretan.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_36.webp"
  },
  {
    "Country": "Basque Country",
    "Union": "STV",
    "Full name": "Solidaridad de los Trabajadores Vascos",
    "Link": "https://www.ela.eus/es?set_language=es",
    "Join link": "https://ela.eus/afiliazioa/afiliazioa.nsf/afiliatu?OpenForm&Hizkuntza=Castellano",
    "SourceImage": "https://www.ela.eus/@@site-logo/ELA_logo_koloretan.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_37.webp"
  },
  {
    "Country": "Basque Country",
    "Union": "LAB",
    "Full name": "Langile Abertzaleen Batzordeak",
    "Link": "https://www.lab.eus/",
    "Join link": "https://afiliatuak.lab.eus/berria",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Lab_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_38.webp"
  },
  {
    "Country": "Belgium",
    "Union": "ABVV",
    "Full name": "Algemeen Belgisch Vakverbond",
    "Link": "https://www.abvv.be/",
    "Join link": "https://www.abvv.be/lid-worden",
    "SourceImage": "https://www.abvv.be/sites/abvv/files/logo_0_0.png",
    "Site lang": "NL",
    "Membership conditions link": "",
    "": "",
    "Image": "1_4.webp"
  },
  {
    "Country": "Belgium",
    "Union": "FGTB",
    "Full name": "Fédération Générale du Travail de Belgique",
    "Link": "https://fgtb.be/",
    "Join link": "https://fgtb.be/devenir-membre",
    "SourceImage": "https://fgtb.be/sites/fgtb/files/logo.png",
    "Site lang": "FR",
    "Membership conditions link": "",
    "": "",
    "Image": "1_5.webp"
  },
  {
    "Country": "Canada",
    "Union": "",
    "Full name": "",
    "Link": "",
    "Join link": "",
    "SourceImage": "",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": ""
  },
  {
    "Country": "Croatia",
    "Union": "SSSH",
    "Full name": "Savez samostalnih sindikata Hrvatske",
    "Link": "https://www.sssh.hr/",
    "Join link": "https://www.sssh.hr/uclani-se",
    "SourceImage": "",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_43.png"
  },
  {
    "Country": "Denmark",
    "Union": "3F",
    "Full name": "Fagligt Fælles Forbund",
    "Link": "https://www.3f.dk/",
    "Join link": "https://www.3f.dk/bliv-medlem/optagelse/start",
    "SourceImage": "https://3f-design.dk/design@/dist/logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_6.webp"
  },
  {
    "Country": "Denmark",
    "Union": "HK",
    "Full name": "HK",
    "Link": "https://www.hk.dk/",
    "Join link": "https://www.hk.dk/blivmedlem",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/6/64/HK_Denmark_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_39.webp"
  },
  {
    "Country": "Denmark",
    "Union": "FOA",
    "Full name": "Forbundet af Offenligt Ansatte",
    "Link": "http://www.foa.dk/",
    "Join link": "https://www.foa.dk/bliv-medlem",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/1/18/Forbundet_af_Offenligt_Ansatte_%28logo%29.jpg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_40.webp"
  },
  {
    "Country": "Estonia",
    "Union": "EAKL",
    "Full name": "Eesti Ametiühingute Keskliit",
    "Link": "https://www.eakl.ee/",
    "Join link": "https://www.eakl.ee/astu-liikmeks",
    "SourceImage": "https://www.eakl.ee/media/2016/10/EAKL_logo_sloganiga_vert_copy.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_7.svg"
  },
  {
    "Country": "Finland",
    "Union": "SAK",
    "Full name": "Suomen Ammattiliittojen Keskusjärjestö",
    "Link": "https://www.sak.fi/",
    "Join link": "https://www.liitot.fi/#search",
    "SourceImage": "https://www.liitot.fi/site/templates/resources/images/logo.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_8.svg"
  },
  {
    "Country": "France",
    "Union": "CGT",
    "Full name": "Confédération Générale du Travail",
    "Link": "http://www.cgt.fr/",
    "Join link": "https://www.cgt.fr/syndicalisation/syndiquez-vous",
    "SourceImage": "https://reference-syndicale.fr/logo-cgt.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_9.webp"
  },
  {
    "Country": "France",
    "Union": "CFDT",
    "Full name": "Confédération française démocratique du travail",
    "Link": "https://www.cfdt.fr",
    "Join link": "https://www.cfdt.fr/adhesion",
    "SourceImage": "https://www.cfdt.fr/upload/docs/image/gif/2012-11/logo.gif",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_10.webp"
  },
  {
    "Country": "France",
    "Union": "FO",
    "Full name": "Force Ouvrière",
    "Link": "http://www.force-ouvriere.fr/",
    "Join link": "https://www.force-ouvriere.fr/adherer",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/a/a8/Force_Ouvri%C3%A8re_%28logo%29.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_11.webp"
  },
  {
    "Country": "Germany",
    "Union": "DGB",
    "Full name": "Deutscher Gewerkschaftsbund",
    "Link": "https://www.dgb.de/",
    "Join link": "https://www.dgb.de/service/mitglied-werden/",
    "SourceImage": "https://www.dgb.de/++resource++dgb/img/dgb-logo.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_12.svg"
  },
  {
    "Country": "Germany",
    "Union": "DBB",
    "Full name": "DBB Beamtenbund und Tarifunion",
    "Link": "https://www.dbb.de/",
    "Join link": "https://www.dbb.de/mitgliedschaft-service/online-beitritt.html",
    "SourceImage": "https://www.dbb.de/fileadmin/templates/www_dbb_de/images//dbb_logo.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_13.svg"
  },
  {
    "Country": "Ireland",
    "Union": "ICTU",
    "Full name": "Irish Congress of Trade Unions",
    "Link": "https://www.ictu.ie/",
    "Join link": "https://www.ictu.ie/join-union",
    "SourceImage": "https://images.squarespace-cdn.com/content/v1/5d36029ba09e370001fa2248/1638989439236-944UQ3CND124N7RMA5X7/Untitled+design+%2824%29.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_15.webp"
  },
  {
    "Country": "Israel",
    "Union": "Histadrut",
    "Full name": "ההסתדרות הכללית של העובדים בארץ ישראל",
    "Link": "https://histadrut.org.il/",
    "Join link": "https://signup.histadrut.org.il/",
    "SourceImage": "https://signup.histadrut.org.il/images/site-logo.png?t=1664766975",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_35.webp"
  },
  {
    "Country": "Italy",
    "Union": "USB",
    "Full name": "Unione Sindacale di Base",
    "Link": "https://www.usb.it/",
    "Join link": "https://www.usb.it/contatti.html",
    "SourceImage": "https://www.usb.it/typo3conf/ext/usb_base/Resources/Public/Logo/main_logo_300x298.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_16.webp"
  },
  {
    "Country": "Italy",
    "Union": "CISL",
    "Full name": "Confederazione Italiana Sindacati Lavoratori",
    "Link": "https://www.cisl.it/",
    "Join link": "https://www.cisl.it/iscriviti-alla-cisl/preiscrizione/",
    "SourceImage": "https://www.cisl.it/wp-content/uploads/2021/01/cisl-web-980x371.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_17.webp"
  },
  {
    "Country": "Lithuania",
    "Union": "",
    "Full name": "Sandrauga",
    "Link": "http://www.sandrauga.lt/",
    "Join link": "http://www.sandrauga.lt/tapk-musu-nariu",
    "SourceImage": "http://www.sandrauga.lt/wp-content/uploads/2019/07/27067147_804098743125127_5588289456798426756_n.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_18.webp"
  },
  {
    "Country": "Luxemburg",
    "Union": "OGBL",
    "Full name": "Independent Luxembourg Trade Union Confederation",
    "Link": "http://www.ogbl.lu/",
    "Join link": "https://hello.ogbl.lu",
    "SourceImage": "http://www.ogbl.lu/wp-content/themes/ogbl-lu/images/ogbl.gif",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_19.webp"
  },
  {
    "Country": "Netherlands",
    "Union": "FNV",
    "Full name": "Federatie Nederlandse Vakbeweging",
    "Link": "https://www.fnv.nl/",
    "Join link": "https://www.fnv.nl/lidmaatschap/lid-worden?broncode=homepage#/",
    "SourceImage": "https://www.fnv.nl/getmedia/f1429ce0-a052-4230-b8fe-b4724ad61bef/logo.svg?ext=.svg&dtime=20220930085025",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_41.svg"
  },
  {
    "Country": "New Zealand",
    "Union": "NZCTU",
    "Full name": "New Zealand Council of Trade Unions",
    "Link": "https://union.org.nz",
    "Join link": "https://union.org.nz/find-your-union/",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/New_Zealand_Council_of_Trade_Unions_logo_2021.jpg/300px-New_Zealand_Council_of_Trade_Unions_logo_2021.jpg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_42.webp"
  },
  {
    "Country": "Norway",
    "Union": "LO",
    "Full name": "Landsorganisasjonen i Norge",
    "Link": "https://www.lo.no/",
    "Join link": "https://minside.lofavor.no/?page=shell&shell=main&main=main-temporary-membership-landing",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/LO-emblem.svg/1024px-LO-emblem.svg.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_20.webp"
  },
  {
    "Country": "Portugal",
    "Union": "CGTP",
    "Full name": "Confederação Geral dos Trabalhadores Portugueses",
    "Link": "http://www.cgtp.pt/",
    "Join link": "http://www.cgtp.pt/sindicalizar-me",
    "SourceImage": "img/simbolo4.jpg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_21.webp"
  },
  {
    "Country": "Quebec",
    "Union": "FTQ",
    "Full name": "Fédération des travailleurs du Québec",
    "Link": "https://ftq.qc.ca/",
    "Join link": "https://ftq.qc.ca/se-syndiquer-a-la-ftq/",
    "SourceImage": "https://ftq.qc.ca/wp-content/themes/henri-theme/images/logo-generique.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_33.svg"
  },
  {
    "Country": "Romania",
    "Union": "BNS",
    "Full name": "Blocul National Sindical",
    "Link": "https://www.bns.ro/",
    "Join link": "https://www.bns.ro/adera-la-bns-actiuni",
    "SourceImage": "https://www.bns.ro/images/bns-sigla2.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_22.webp"
  },
  {
    "Country": "Singapore",
    "Union": "NTUC",
    "Full name": "National Trades Union Congress",
    "Link": "https://www.ntuc.org.sg/",
    "Join link": "https://www.ntuc.org.sg/wps/portal/up2/home/eservices?ext=portal&product=member&gbSignupSource=cancel",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/e/e5/Umedium_red.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_34.webp"
  },
  {
    "Country": "Spain",
    "Union": "CCOO",
    "Full name": "Comisiones Obreras",
    "Link": "https://www.ccoo.es/",
    "Join link": "https://afiliate.ccoo.es/afiliate/afiliate.htm",
    "SourceImage": "https://afiliate.ccoo.es/afiliate/img/logotipos/ccoo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_23.webp"
  },
  {
    "Country": "Spain",
    "Union": "UGT",
    "Full name": "Unión General de Trabajadores",
    "Link": "https://ugt.es/",
    "Join link": "https://www.ugt.es/ficha-de-afiliacion",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/3/3b/UGT_flag.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_24.svg"
  },
  {
    "Country": "Spain",
    "Union": "USO",
    "Full name": "Unión Sindical Obrera",
    "Link": "https://www.uso.es",
    "Join link": "https://www.uso.es/formulario-afiliacion",
    "SourceImage": "https://www.uso.es/wp-content/uploads/2014/07/logo-USO-min2.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_25.webp"
  },
  {
    "Country": "Sweden",
    "Union": "LO",
    "Full name": "Landsorganisationen i Sverige",
    "Link": "https://lo.se/",
    "Join link": "https://www.bytlofack.se/byt",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b1/Swedish_LO.svg/188px-Swedish_LO.svg.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_26.webp"
  },
  {
    "Country": "Switzerland",
    "Union": "SGB",
    "Full name": "Swiss Trade Union Federation",
    "Link": "https://www.sgb.ch/",
    "Join link": "https://uss.sgb.ch/mitgliedwerden",
    "SourceImage": "https://uss.sgb.ch/sites/all/themes/sgb_theme/logo.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_27.svg"
  },
  {
    "Country": "Switzerland",
    "Union": "TS",
    "Full name": "Travail.Suisse (German)",
    "Link": "https://www.travailsuisse.ch/",
    "Join link": "https://www.travailsuisse.ch/de/mitglied-werden",
    "SourceImage": "https://www.travailsuisse.ch/themes/custom/design/logo.svg",
    "Site lang": "DE",
    "Membership conditions link": "",
    "": "",
    "Image": "1_28.svg"
  },
  {
    "Country": "Switzerland",
    "Union": "TS",
    "Full name": "Travail.Suisse (French)",
    "Link": "https://www.travailsuisse.ch/",
    "Join link": "https://www.travailsuisse.ch/fr/devenir-membre",
    "SourceImage": "https://www.travailsuisse.ch/themes/custom/design/logo.svg",
    "Site lang": "FR",
    "Membership conditions link": "",
    "": "",
    "Image": "1_29.svg"
  },
  {
    "Country": "United Kingdom",
    "Union": "TUC",
    "Full name": "Trades Union Congress",
    "Link": "https://www.tuc.org.uk/",
    "Join link": "https://www.tuc.org.uk/join-a-union",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/f/f7/TUC_Logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": "1_30.webp"
  },
  {
    "Country": "USA",
    "Union": "",
    "Full name": "",
    "Link": "",
    "Join link": "",
    "SourceImage": "",
    "Site lang": "",
    "Membership conditions link": "",
    "": "",
    "Image": ""
  }
];
union_data2 = [
  {
    "Country": "USA",
    "Union": "ALU",
    "Full name": "Amazon Labor Union",
    "Link": "https://www.amazonlaborunion.org/",
    "Join link": "https://www.amazonlaborunion.org/contact",
    "SourceImage": "https://images.squarespace-cdn.com/content/v1/62923f4f74bc7d0c025784fc/8b448acc-1c7b-4158-9183-5c4e5a2d2243/ALU_LOGO__Primary_BLK.png?format=1500w",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Amazon",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_2.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "UAW",
    "Full name": "United Auto Workers",
    "Link": "https://uaw.org/",
    "Join link": "https://uaw.org/organize/contact-uaw-organizing/",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/4/4e/United_Auto_Workers_%28logo%29.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Auto worker",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_3.svg"
  },
  {
    "Country": "USA;Canada",
    "Union": "UBC",
    "Full name": "United Brotherhood of Carpenters and Joiners of America",
    "Link": "https://www.carpenters.org/",
    "Join link": "https://www.carpenters.org/join-us/",
    "SourceImage": "https://www.carpenters.org/wp-content/themes/carpenters/assets/images/ubc_logo.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Carpenter or joiner",
    "Direct join": "No",
    "Apprenticeships": "Yes",
    "Apprenticeship link": "",
    "Image": "2_4.svg"
  },
  {
    "Country": "USA;Canada",
    "Union": "UNITE HERE",
    "Full name": "UNITE HERE",
    "Link": "https://unitehere.org",
    "Join link": "https://unitehere.org/organize-a-union/#1",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/UNITE_HERE_logo.png/330px-UNITE_HERE_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Casino",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_5.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "IBEW",
    "Full name": "International Brotherhood of Electrical Workers",
    "Link": "http://www.ibew.org/",
    "Join link": "https://www.ibew.org/Join-the-IBEW",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7f/International_Brotherhood_of_Electrical_Workers_%28emblem%29.png/263px-International_Brotherhood_of_Electrical_Workers_%28emblem%29.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Electrician",
    "Direct join": "No",
    "Apprenticeships": "Yes",
    "Apprenticeship link": "",
    "Image": "2_6.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "IATSE",
    "Full name": "International Alliance of Theatrical Stage Employees",
    "Link": "https://iatse.net/",
    "Join link": "https://iatse.net/join/",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/6/6f/IATSE_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Entertainment: Theater, Motion Picture & Television, Trade Shows",
    "Direct join": "Yes",
    "Apprenticeships": "Yes",
    "Apprenticeship link": "",
    "Image": "2_7.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "IAFF",
    "Full name": "International Association of Fire Fighters",
    "Link": "https://www.iaff.org/",
    "Join link": "https://www.iaff.org/how-to-join/",
    "SourceImage": "https://www.iaff.org/wp-content/uploads/IAFF_Logos/IAFF_logo-176px.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Firefighter",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_8.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "UNITE HERE",
    "Full name": "UNITE HERE",
    "Link": "https://unitehere.org",
    "Join link": "https://unitehere.org/organize-a-union/#3",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/UNITE_HERE_logo.png/330px-UNITE_HERE_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Garment manufacturing",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_9.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "SEIU",
    "Full name": "Service Employees International Union",
    "Link": "https://www.seiu.org/",
    "Join link": "https://act.seiu.org/a/website-signup",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/4/4b/Seiu_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Healthcare and related workers",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_10.webp"
  },
  {
    "Country": "USA",
    "Union": "NNU",
    "Full name": "National Nurses United",
    "Link": "http://www.nationalnursesunited.org/",
    "Join link": "https://go.nationalnursesunited.org/signup/organize/",
    "SourceImage": "https://cdn.inksoft.com/images/clipart/rendered/unionbug_unionbug.com/26260_NNU_BASEBALL_T.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Healthcare and related workers",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_33.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "UNITE HERE",
    "Full name": "UNITE HERE",
    "Link": "https://unitehere.org",
    "Join link": "https://unitehere.org/organize-a-union/#202324575847056",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/UNITE_HERE_logo.png/330px-UNITE_HERE_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Hotel",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_11.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "IW",
    "Full name": "International Association of Bridge, Structural, Ornamental and Reinforcing Iron Workers",
    "Link": "https://www.ironworkers.org/",
    "Join link": "https://www.ironworkers.org/get-organized/organizing-assistance-request",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/e/ed/Ironworkers_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Ironworker",
    "Direct join": "No",
    "Apprenticeships": "Yes",
    "Apprenticeship link": "https://www.ironworkers.org/become-an-ironworker/do-you-have-what-it-takes-",
    "Image": "2_32.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "LIUNA",
    "Full name": "Laborers' International Union of North America",
    "Link": "https://www.liuna.org/",
    "Join link": "https://www.liuna.org/how-to-join",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/LIUNA_logo.svg/330px-LIUNA_logo.svg.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Laborer",
    "Direct join": "No",
    "Apprenticeships": "Yes",
    "Apprenticeship link": "",
    "Image": "2_12.webp"
  },
  {
    "Country": "USA",
    "Union": "NALC",
    "Full name": "National Association of Letter Carriers",
    "Link": "https://www.nalc.org/",
    "Join link": "https://www.nalc.org/about/join-nalc",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/NALC_logo.svg/225px-NALC_logo.svg.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Letter carrier",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_13.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "IAM",
    "Full name": "International Association of Machinists and Aerospace Workers",
    "Link": "https://www.goiam.org/",
    "Join link": "https://www.goiam.org/about/join-the-union/",
    "SourceImage": "https://www.goiam.org/wp-content/uploads/2016/07/IAM-Logo-Color-300.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Machinist or aircraft worker",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_14.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "OPEIU",
    "Full name": "Office and Professional Employees International Union",
    "Link": "https://www.opeiu.org/",
    "Join link": "https://www.opeiu.org/NeedAUnion/JoinContactUs.aspx",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/6/6d/OPEIU_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Office worker",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_15.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "IBT",
    "Full name": "International Brotherhood of Teamsters",
    "Link": "https://teamster.org/",
    "Join link": "",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/d/d4/Teamsters_Union_Logo.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Other",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_16.svg"
  },
  {
    "Country": "USA;Canada",
    "Union": "USW",
    "Full name": "United Steelworkers",
    "Link": "https://www.usw.org/",
    "Join link": "https://www.usw.org/join",
    "SourceImage": "https://www.usw.org/theme/img/logo.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Other",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_17.svg"
  },
  {
    "Country": "USA",
    "Union": "EWOC",
    "Full name": "Emergency Workplace Organizing Committee",
    "Link": "https://workerorganizing.org/",
    "Join link": "https://workerorganizing.org/support/",
    "SourceImage": "https://workerorganizing.org/wp-content/uploads/2022/02/cropped-emergency-workplace-organizing-committee-logo-nav.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Other",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_18.webp"
  },
  {
    "Country": "USA",
    "Union": "AFL-CIO",
    "Full name": "American Federation of Labor",
    "Link": "https://aflcio.org/formaunion/",
    "Join link": "https://aflcio.org/formaunion",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/AFL-CIO-seal.svg/1024px-AFL-CIO-seal.svg.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Other",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_19.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "IWW",
    "Full name": "Industrial Workers of the World",
    "Link": "https://www.iww.org/",
    "Join link": "https://www.iww.org/organize/",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Iwwlogo.svg/255px-Iwwlogo.svg.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Other",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_20.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "IUPAT",
    "Full name": "The International Union of Painters and Allied Trades",
    "Link": "https://www.iupat.org/",
    "Join link": "https://www.iupat.org/join-us/",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/d/d7/IUPAT_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Painter",
    "Direct join": "No",
    "Apprenticeships": "Yes",
    "Apprenticeship link": "",
    "Image": "2_21.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "UA",
    "Full name": "United Association of Journeymen and Apprentices of the Plumbing and Pipe Fitting Industry",
    "Link": "https://ua.org",
    "Join link": "https://ua.org/join-the-ua/",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/7/7c/United_association_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Plumbers and pipefitters",
    "Direct join": "No",
    "Apprenticeships": "Yes",
    "Apprenticeship link": "",
    "Image": "2_31.webp"
  },
  {
    "Country": "USA",
    "Union": "APWU",
    "Full name": "American Postal Workers Union",
    "Link": "https://apwu.org/",
    "Join link": "https://apwu.org/join",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/American_Postal_Workers_Union_logo.svg/330px-American_Postal_Workers_Union_logo.svg.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Postal (non-letter carrier)",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_22.webp"
  },
  {
    "Country": "USA",
    "Union": "AFSCME",
    "Full name": "American Federation of State, County and Municipal Employees",
    "Link": "http://afscme.org/",
    "Join link": "https://www.afscme.org/join/form-union",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/f/f7/AFSCME_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Public employees",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_23.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "UNITE HERE",
    "Full name": "UNITE HERE",
    "Link": "https://unitehere.org",
    "Join link": "https://unitehere.org/organize-a-union/#2",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/UNITE_HERE_logo.png/330px-UNITE_HERE_logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Restaurant, and commercial food service",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_24.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "UFCW",
    "Full name": "United Food and Commercial Workers",
    "Link": "https://www.ufcw.org/",
    "Join link": "https://www.ufcw.org/start-a-union/#ready-go",
    "SourceImage": "https://www.ufcw.org/wp-content/blogs.dir/61/files/2020/09/logo-1-1.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Retail",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_25.svg"
  },
  {
    "Country": "USA",
    "Union": "NEA",
    "Full name": "National Education Association",
    "Link": "https://www.nea.org/",
    "Join link": "https://www.mynea360.org/s/join-now",
    "SourceImage": "https://www.nea.org/themes/custom/locker/plab/public/images/sample/NEA_logo.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Teachers and other school employees",
    "Direct join": "Yes",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_26.svg"
  },
  {
    "Country": "USA;Canada",
    "Union": "CODE-CWA",
    "Full name": "Campaign to Organize Digital Employees",
    "Link": "https://code-cwa.org/",
    "Join link": "https://code-cwa.org/organize",
    "SourceImage": "https://code-cwa.org/sites/default/files/styles/image_media_large/public/logos/code-cwa_logo_lockup-576x248.png.webp?itok=tXAb4UlJ",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Tech, programmers and other software workers",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_27.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "CWA",
    "Full name": "Communications Workers of America",
    "Link": "https://cwa-union.org/",
    "Join link": "https://cwa-union.org/organize-union-your-workplace",
    "SourceImage": "https://cwa-union.org/themes/custom/cwa_union/logo.svg",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Telecommunications and tech",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_28.svg"
  },
  {
    "Country": "USA;Canada",
    "Union": "ATU",
    "Full name": "Amalgamated Transit Union",
    "Link": "https://atu.org/",
    "Join link": "https://atu.org/action/join-the-atu",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/ATU_logo.svg/330px-ATU_logo.svg.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Transit",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_29.webp"
  },
  {
    "Country": "USA",
    "Union": "TWU",
    "Full name": "Transport Workers Union of America",
    "Link": "https://www.twu.org/",
    "Join link": "https://www.twu.org/contact-an-organizer/",
    "SourceImage": "https://www.twu.org/wp-content/uploads/2020/12/twu-logo.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Transit",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_34.webp"
  },
  {
    "Country": "USA;Canada",
    "Union": "RWDSU",
    "Full name": "Retail, Wholesale and Department Store Union",
    "Link": "",
    "Join link": "https://www.rwdsu.info/contact_an_organizer",
    "SourceImage": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/RWDSU_logo.svg/1200px-RWDSU_logo.svg.png",
    "Site lang": "",
    "Membership conditions link": "",
    "Occupation": "Warehouse",
    "Direct join": "No",
    "Apprenticeships": "",
    "Apprenticeship link": "",
    "Image": "2_30.webp"
  }
];