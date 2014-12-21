var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';
var uporabnikiIme=[];
var uporabniki=[];
var uporabnikiPriimek=[];
var uporabnikiId=[];
var uporabnikiDan=[];
var uporabnikiMes=[];
var uporabnikiLeto=[];
var stevec=3;
var visina1;
var trenutnateza;
var besedilo;


var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function myfunction(){
	$('#osebnipodatki').hide();
	$('#vnos').show();
	$('#rezultati').hide();
	
	$('#uporabnik').empty();
	var sel = document.getElementById('uporabnik');
	for(var i=0;i<stevec;i++){
		var uporabnik=uporabnikiIme[i]+" "+uporabnikiPriimek[i];
		var opt = document.createElement('option');
		opt.innerHTML = uporabnik;
		opt.value = uporabnik;
		sel.appendChild(opt);
	}
}

function myfunction1(){
	$('#osebnipodatki').show();
	$('#vnos').hide();
	$('#rezultati').hide();
}

function myfunction2(){
	$('#osebnipodatki').hide();
	$('#vnos').hide();
	$('#rezultati').show();
	
	$('#uporabnik1').empty();
	var sel = document.getElementById('uporabnik1');
	for(var i=0;i<stevec;i++){
		var uporabnik=uporabnikiIme[i]+" "+uporabnikiPriimek[i];
		var opt = document.createElement('option');
		opt.innerHTML = uporabnik;
		opt.value = uporabnik;
		sel.appendChild(opt);
	}
	
}

function izpis(){
	var ime=$('#uporabnik1 :selected').text();
	var id;
	for(var i=0;i<stevec;i++){
		if(uporabnikiIme[i]+" "+uporabnikiPriimek[i]==ime){
			id=uporabnikiId[i];
		}
	}
	$('#sporociId').append(id);
}


function kreirajEHRzaBolnika() {
	
	sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var dan=$('#select2 :selected').text();
	var leto=$('#select :selected').text();
	var mesec=$('#select1 :selected').text();
	var datumRojstva = leto+"-"+dan+"-"+mesec;
	

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#kreirajSporocilo").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
		                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
		                    $("#preberiEHRid").val(ehrId);
		                    uporabnikiIme[stevec]=ime;
		                    uporabnikiPriimek[stevec]=priimek;
		                    uporabniki[stevec]=ime+" "+priimek;
		                    uporabnikiId[stevec]=ehrId;
		                    stevec++;
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
		            	console.log(JSON.parse(err.responseText).userMessage);
		            }
		        });
		    }
		});
	}
}


function preberiEHRodBolnika() {
	sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#preberiSporocilo").html("<span class='obvestilo label label-success fade-in'>Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.</span>");
				console.log("Bolnik '" + party.firstNames + " " + party.lastNames + "', ki se je rodil '" + party.dateOfBirth + "'.");
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
			}
		});
	}	
}


function dodajMeritveVitalnihZnakov() {
	sessionId = getSessionId();
	var telesnaVisina = $("#visina").val();
	var telesnaTeza = $("#teza").val();
	var srcniUtripGib = $("#pulseGib").val();
	var ime= $('#uporabnik :selected').text();
	var ehrId = pridobiId();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		   "ctx/language": "en",
		    "ctx/territory": "SI",
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		    "vital_signs/pulse:0/any_event:0/rate|magnitude":srcniUtripGib,
			"vital_signs/pulse:0/any_event:0/rate|unit":"/min",
		    };
		var parametriZahteve = {
		    "ehrId": ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: ime
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	console.log(res.meta.href);
		        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
		    }
		});
	}
}

function pridobiId(){
	var id;
	var ime=$('#uporabnik :selected').text();
	for(var i=0;i<stevec;i++){
		if(uporabnikiIme[i]+" "+uporabnikiPriimek[i]==ime){
			id=uporabnikiId[i];
		}
	}
	return id;
}

function pridobiId1(){
	var id;
	var ime=$('#uporabnik1 :selected').text();
	for(var i=0;i<stevec;i++){
		if(uporabnikiIme[i]+" "+uporabnikiPriimek[i]==ime){
			id=uporabnikiId[i];
		}
	}
	return id;
}

function preberiMeritveVitalnihZnakov() {
	sessionId = getSessionId();	
	var ime= $('#uporabnik :selected').text();
	var ehrId = pridobiId1();
	$('#rezultati2').empty();
	$('#rezultati3').empty();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#rezultati1").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultati1").html("<br/><span>Pridobivanje podatkov za <b>'"+ party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
					    		trenutnateza=res[0].weight;
						    	var zgubljenaTeza=res[res.length-1].weight-res[0].weight;
						    	if(zgubljenaTeza<0){
						    		zgubljenaTeza=res[0].weight-res[res.length-1].weight;
						    		besedilo="Pridobili ste "+zgubljenaTeza+" kilogramov.";
						    	}else{
						    		besedilo="Od zacetka ste izgubili"+zgubljenaTeza+" kilogramov.";
						    	}
					    	} else {
					    		$("#rezultati1").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#rezultati1").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});					
	    	},
	    	error: function(err) {
	    		$("#rezultati1").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
	    	
	    	
	    	
	    	
		});
		
		
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultati1").html("<br/><span>Pridobivanje podatkov za <b>'"+ party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "height",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	visina1=res[0].height;
						    	alert(visina1);
						    	var itm=(trenutnateza/((visina1/100)*(visina1/100)));
						    	besedilo=besedilo + "\nVas trenutni itm je "+itm;
						    	if(itm<20){
						    		besedilo=besedilo+". Glede na mejnik ste v podhranjenosti.";
						    	}else if(itm<25){
						    		besedilo=besedilo+". Glede na mejnik imate normalno tezo.";
						    	}else if(itm<30){
						    		besedilo=besedilo+". Glede na mejnik ste v debelosti stopnje 1.";
						    	}else if(itm<40){
						    		besedilo=besedilo+". Glede na mejnik ste v debelosti stopnje 2.";
						    	}else{
						    		besedilo=besedilo+". Glede na mejnik ste v debelosti stopnje 3.";
						    	}
						    	$('#rezultati2').append(besedilo);
					    	} else {
					    		$("#rezultati1").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#rezultati1").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});					
	    	},
	    	error: function(err) {
	    		$("#rezultati1").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
	    	
	    	
	    	
	    	
		});
		
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultati1").html("<br/><span>Pridobivanje podatkov za <b>'"+ party.firstNames + " " + party.lastNames + "'</b>.</span><br/><br/>");
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "pulse",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
						    	var results = "<table class='table table-striped table-hover'><tr><th>Datum in ura</th><th class='text-right'>utrip</th></tr>";
						        for (var i in res) {
						            results += "<tr><td>" + res[i].time + "</td><td class='text-right'>" + res[i].pulse + " " 	+ res[i].unit + "</td>";
						            if(res[i].pulse>+175){
						            	var opozorilo="Pri merjenju dne "+res[i].time+" je zabelezen visok srcni utrip.";
						            	$("#rezultati3").html("<span class='obvestilo label label-warning fade-in'>"+opozorilo+"</span>");
						            }
						        }
						        results += "</table>";
						        $("#rezultati1").append(results);
					    	} else {
					    		$("#rezultati1").html("<span class='obvestilo label label-warning fade-in'>Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#rezultati1").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
							console.log(JSON.parse(err.responseText).userMessage);
					    }
					});					
	    	},
	    	error: function(err) {
	    		$("#rezultati1").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
				console.log(JSON.parse(err.responseText).userMessage);
	    	}
	    	
	    	
	    	
	    	
		});
	}
}

//kreiranje 3 uporabnikov

function kreirajUporabnike(){
	sessionId = getSessionId();
	for(var i=0;i<3;i++){
		var ime = uporabnikIme[i];
		var priimek = uporabnikiPriimek[i];
		var dan=uporabnikiDan[i];
		var leto=uporabnikiMes[i];
		var mesec=uporabnikiLeto[i];
		var datumRojstva = leto+"-"+dan+"-"+mesec;
		var ehrId;

		if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
			$("#kreirajSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
		} else {
			$.ajaxSetup({
		    	headers: {"Ehr-Session": sessionId}
			});
			$.ajax({
			    url: baseUrl + "/ehr",
			    type: 'POST',
			    success: function (data) {
			        ehrId = data.ehrId;
			        var partyData = {
			            firstNames: ime,
			            lastNames: priimek,
			            dateOfBirth: datumRojstva,
			            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
			        };
			        $.ajax({
			            url: baseUrl + "/demographics/party",
			            type: 'POST',
			            contentType: 'application/json',
			            data: JSON.stringify(partyData),
			            success: function (party) {
			                if (party.action == 'CREATE') {
			                    $("#kreirajSporocilo").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "'.</span>");
			                    console.log("Uspešno kreiran EHR '" + ehrId + "'.");
			                    $("#preberiEHRid").val(ehrId);
			                    uporabnikiId[i]=ehrId;
			                }
			            },
			            error: function(err) {
			            	$("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
			            	console.log(JSON.parse(err.responseText).userMessage);
			            }
			        });
			    }
			});
		}
		
		for(var j=0;j<4;j++){
			var telesnaVisina;
			var telesnaTeza;
			var srcniUtripGib;
			var ime="noben";
			if(i==0){
				telesnaVisina = 195;
				if(j==0){
					telesnaTeza = 85;
					srcniUtripGib = 120;
				}else if(j==1){
					telesnaTeza = 84;
					srcniUtripGib = 126;
				}else if(j==2){
					telesnaTeza = 85;
					srcniUtripGib = 123;
				}else if(j==3){
					telesnaTeza = 86;
					srcniUtripGib = 130;
				}
			}
			if(i==1){
				telesnaVisina = 183;
				if(j==0){
					telesnaTeza = 110;
					srcniUtripGib = 180;
				}else if(j==1){
					telesnaTeza = 105;
					srcniUtripGib = 170;
				}else if(j==2){
					telesnaTeza = 97;
					srcniUtripGib = 168;
				}else if(j==3){
					telesnaTeza = 94;
					srcniUtripGib = 166;
				}
			}
			if(i==2){
				telesnaVisina = 169;
				if(j==0){
					telesnaTeza = 65;
					srcniUtripGib = 160;
				}else if(j==1){
					telesnaTeza = 65;
					srcniUtripGib = 155;
				}else if(j==2){
					telesnaTeza = 64;
					srcniUtripGib = 157;
				}else if(j==3){
					telesnaTeza = 62;
					srcniUtripGib = 154;
				}
			}

			if (!ehrId || ehrId.trim().length == 0) {
				$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
			} else {
				$.ajaxSetup({
				    headers: {"Ehr-Session": sessionId}
				});
				var podatki = {
					// Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
				   "ctx/language": "en",
				    "ctx/territory": "SI",
				    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
				    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
				    "vital_signs/pulse:0/any_event:0/rate|magnitude":srcniUtripGib,
					"vital_signs/pulse:0/any_event:0/rate|unit":"/min",
				    };
				var parametriZahteve = {
				    "ehrId": ehrId,
				    templateId: 'Vital Signs',
				    format: 'FLAT',
				    committer: ime
				};
				$.ajax({
				    url: baseUrl + "/composition?" + $.param(parametriZahteve),
				    type: 'POST',
				    contentType: 'application/json',
				    data: JSON.stringify(podatki),
				    success: function (res) {
				    	console.log(res.meta.href);
				        $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-success fade-in'>" + res.meta.href + ".</span>");
				    },
				    error: function(err) {
			    	$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
					console.log(JSON.parse(err.responseText).userMessage);
				    }
				});
			}
		}
	}
}


$(document).ready(function() {
	$('#vnos').hide();
	$('#rezultati').hide();
	uporabnikiIme[0]="Steve";
	uporabnikiIme[1]="Bill";
	uporabnikiIme[2]="Mojca";
	uporabnikiPriimek[0]="Sluzba";
	uporabnikiPriimek[1]="Vrata";
	uporabnikiPriimek[2]="Pokraculja";
	uporabnikiDan[0]=07;
	uporabnikiDan[1]=11;
	uporabnikiDan[2]=24;
	uporabnikiMes[0]=07;
	uporabnikiMes[1]=10;
	uporabnikiMes[2]=04;
	uporabnikiLeto[0]=1990;
	uporabnikiLeto[1]=1970;
	uporabnikiLeto[2]=1982;
	uporabniki[0]="Steve Sluzba";
	uporabniki[1]="Bill Vrata";
	uporabniki[2]="Mojca Pokraculja";
	uporabnikiId[0]="ab044f15-7ad8-4f4b-8f75-e258c9700b82";
	uporabnikiId[1]="7e2b766c-6fd4-4cee-b25a-694ab3befde9";
	uporabnikiId[2]="16145a20-412f-4034-afaf-93cb210c6237";
});