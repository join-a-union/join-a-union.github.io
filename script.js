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
    firstLoad = false;
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

function loadBG(){
    const windowWidth = window.innerWidth;
    if (windowWidth >= 600) {
        document.body.style.backgroundImage = "url('img/bg.avif')";
    } else {
        document.body.style.backgroundImage = "url('img/bg-600px.avif')";
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
    
    loadBG();
    
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