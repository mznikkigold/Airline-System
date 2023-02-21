$(document).ready(function () {
    var chat = $.connection.chathub;
    var $click = 'report';
    var $flight = [];
    var passengers = [], flight_id = null;
    app_storage = window.localStorage;
    var login_type =  JSON.parse(app_storage.getItem('login_type'));
    var $editdata = [];
    var $edit_id = null
    console.log(chat)
    var page = function(){
        return {
            init: function(){
                $.connection.hub.start().done(() => {
                    console.log('connection to hub')
                    page.server();
                });
            },
            server: function(){
               
                // page.userLoader();
                console.log(login_type)
                if(login_type.user_type == "customer"){
                    page.allflight();
                }else{
                    page.fetchRecords();
                }
                page.pageEvents()
              
              
            },
            fetchRecords: function(){
                if ($click == "report"){
                    chat.server.sp_selection(`{"data_type": "select", "user_id": ${login_type.user_id}}`,$click).done((data) =>{
                        console.log(data);
                        page.buildReport(JSON.parse(data));
                    });
                }else{
                    chat.server.sp_app_management(`{"data_type": "select", "user_id": ${login_type.user_id}}`,$click).done((data) =>{
                        console.log(data);
                        page.fetchResponse(JSON.parse(data));
                    });
                }
               
            },
            buildReport: function(data){
                console.log(data);
                var boxes = data.TABLE_0[0];
                console.log(boxes);

                setTimeout(() => {
                    $('#total_staff').html(boxes.staff_count)
                    $('#total_flight').html(boxes.flight_count)
                    $('#total_booking').html(boxes.booking_count)
                    $('#total_pass').html(boxes.passenger_count)
                    }, 2000
                );
                var tbody = "";
                data.TABLE_1.forEach((o, i) =>{
                    tbody += `<tr><td>${i + 1}</td><td>${o.staff_name}</td><td>${o.staff_schedule}</td></tr>`
                });
                $('#pilot_schedule tbody').html(tbody)

                var tbody = "";
                data.TABLE_2.forEach((o, i) =>{
                    tbody += `<tr><td>${i + 1}</td><td>${o.origin} to ${o.destination}</td><td>${o.passenger_count}</td></tr>`
                });
                $('#no_of_passenger tbody').html(tbody);

                var tbody = "";
                data.OUTPUT.forEach((o, i) =>{
                    tbody += `<tr><td>${i + 1}</td><td>${o.staff_name}</td><td>${o.staff_working_hours}</td></tr>`
                });
                $('#pilot_working_hours tbody').html(tbody)

                page.pageEvents();
            },
            allflight: function(){
                console.log(login_type)
                chat.server.sp_selection('','all flight').done((data) =>{
                    console.log(data);
                    data = JSON.parse(data);
                   var html = "";
                    if(data.OUTPUT !== null || data.OUTPUT !== undefined){               
                        data.OUTPUT.forEach((o, i) =>{
                            html += `<div class="col-sm-6 col-lg-3">
                            <div class="card-box">
                                <div class="contact-card">
                                    <div class="member-info" style="padding-left: 0px !important;padding-bottom: 0px; !important">
                                        <h4 class="m-t-0 m-b-5 header-title">
                                            <b>${o.flight}</b>
                                        </h4>
                                        <p class="text-muted">$${o.flight_price}</p>
                                        <p class="text-dark">
                                            <i class="md md-business m-r-10"></i>
                                            <small>Depature: ${o.depature}</small>
                                        </p><p class="text-dark">
                                            <i class="md md-business m-r-10"></i>
                                            <small>Arrival: ${o.arrival}</small>
                                        </p>
                                        <div class="contact-action">
                                            <a data-bookid="${o.flight_id}" class="btn btn-success btn-sm bookflight" data-toggle="modal" data-target="#tabs-modal">Book</a>
                                            
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>`
                        });
                            
                        }
                    $('.allflight').html(html);
                    page.pageEvents();
                    });
                
            },
            userLoader: function(){
                chat.server.sp_selection('','USER SELECT').done((data) =>{
                    data = JSON.parse(data)
                    console.log(data);
                    $('#from, #to').html(page.dropdown(data.OUTPUT, 'a location...'));
                    $('#country').html(page.dropdown(data.TABLE_0, 'a Country'));
                });
            },         
            fetchResponse: function(data){
                console.log(data);
                console.log($click);
                $editdata = data.RESULT;
                var tbody = '', thead = '';
                $click = $click.toLowerCase();
                data.RESULT.forEach(function (o, i) {
                    if ($click == "staff"){
                        thead = `<tr><th>S/N</th><th> Surname Name</th> <th> Given Name</th><th>Gender</th> <th>Email</th><th>Phone</th> <th>Salary</th> <th>Type</th><th>Rating</th></tr>`;
                        tbody += `<tr><td>${i + 1 }</td><td>${o.staff_surname}</td><td>${o.staff_given_name}</td><td>${o.staff_gender}</td><td>${o.staff_email}</td><td>${o.staff_phone_number}</td><td>${o.staff_salary}</td><td>${o.staff_type}</td><td>${o.staff_rating_id}</td>
                        <td><a class="label label-success edit" data-temp="staff" data-text="STAFF_ID" data-id="${o.staff_id}">Edit</a></td>
                        <td><a class="label label-danger delete"   data-id="${o.staff_id}">Delete</a></td></tr>`
                    }

                    if ($click == "machines"){
                        thead = `<tr><th>S/N</th><th>Serial Number</th> <th>Manufacturer</th><th>Model Number</th> <th>Aircraft</th></tr>`
                        tbody += `<tr><td>${i + 1}</td><td>${o.a_serial_number}</td><td>${o.a_manufacturer}</td><td>${o.a_model_number}</td><td>${o.aircraft}</td>
                        <td><a class="label label-success edit" data-temp="machines" data-text="aircraft_id" data-id="${o.aircraft_id}">Edit</a></td>
                        <td><a class="label label-danger delete" data-id="${o.aircraft_id}">Delete</a></td></tr>`
                    }
                  
                    if ($click == "flights"){
                        thead = `<tr><th>S/N</th><th>Code</th><th>Schudule</th><th>Price</th><th>Aircraft</th><th>Pilot</th><th>Origin</th><th>Destination</th><th>Depature Time</th><th>Arrival Time</th><th>Action</th></tr>`;
                        tbody += `<tr><td>${i + 1}</td><td>${o.flight_code}</td><td>${o.flight_schedule}</td><td>${o.flight_price}</td>
                        <td>${o.aircraft}</td><td>${o.pilot}</td>
                        <td>${o.origin}</td><td>${o.destination}</td><td>${o.flight_dept_time}</td><td>${o.flight_arr_time}</td>
                        <td><a class="label label-success edit" data-temp="flights" data-text="flight_id" data-id="${o.flight_id}">Edit</a></td>
                        <td><a class="label label-danger delete" data-id="${o.flight_id}">Delete</a></td></tr>`
                    }
                    if ($click == "booking details"){
                        thead = `<tr><th>Booking No</th><th>flight</th><th>User Name</th><th>User Email</th><th>Booking Date</th><th>Booking Amount</th></tr>`;
                        tbody += `<tr><td>#${o.booking_id}</td><td>${o.flight}</td><td>${o.username}</td><td>${o.useremail}</td><td>${o.booking_date}</td><td>${o.booking_amount}</td></td>
                        <td><a class="label label-warning cancel" data-id="${o.booking_id}">Cancel</a></td></tr>`
                    }
                    if ($click == "my bookings"){
                        thead = `<tr><th>Booking No</th><th>flight</th><th>Passenger</th><th>Booking Date</th><th>Booking Amount</th></tr>`;
                        tbody += `<tr><td>#${o.booking_id}</td><td>${o.flight}</td><td>${o.passengers_count}</td><td>${o.booking_date}</td><td>${o.booking_amount}</td></td>
                        <td><a class="label label-warning cancel" data-id="${o.booking_id}">Cancel Booking</a></td>
                        </tr>`
                    }
                    if ($click == "my passengers"){
                        thead = `<tr><th>Booking #</th><th>Name</th><th>Passport No</th><th>Address</th>
                        <th>Phone</th><th>Dob</th><th>Gender</th></tr>`;
                                tbody += `<tr><td>${o.booking_id}</td><td>${o.pass_surname} ${o.pass_given_name}</td><td>${o.pass_passport_no}</td>
                                <td>${o.pass_address}</td><td>${o.pass_telephone}</td>
                                <td>${o.pass_dob}</td><td>${o.pass_gender}</td>
                                </tr>`
                    }
                    if ($click == "machine and pilot details"){
                        thead = `<tr><th>Aircraft</th><th>Pilot</th></tr>`;
                        tbody += `<tr><td>${o.aircraft}</td><td>${o.pilot}</td>
                        </tr>`
                    }
                    if ($click == "passenger and bookings"){
                        thead = `<tr><th>Booking #</th><th>Name</th><th>Passport No</th><th>Address</th>
                                <th>Phone</th><th>Dob</th><th>Gender</th></tr>`;
                        tbody += `<tr><td>${o.booking_id}</td><td>${o.pass_surname} ${o.pass_given_name}</td><td>${o.pass_passport_no}</td>
                        <td>${o.pass_address}</td><td>${o.pass_telephone}</td>
                        <td>${o.pass_dob}</td><td>${o.pass_gender}</td>
                        </tr>`
                    }
                })
                console.log(thead);
                $('.mydatatable thead').html(thead);
                $('.mydatatable tbody').html(tbody);
              
                page.pageEvents();
            },
            dropdown: function(data, text){
                var option = `<option value="">Select ${text}</option>`;
                if (data !== undefined){
                    if (data.length> 0){
                        data.forEach(function(o,i){
                            option += `<option value="${o.id}">${o.id_text}</option>` 
                        });
                     }
                }
                return option;
            },
            formater: function(a){
                var html = ''
                a.split(',').forEach((o) =>{
                    html += "<li>" + o + "</li>"
                });
                return "<ul>" + html + "</ul>"
            },
            fetcher: function($arr, action_type){
                chat.server.sp_selection($arr, action_type).done(data => {
                    data = JSON.parse(data);
                    console.log(data);
                   
                    if (data.STATUS == "SUCCESS"){
                        page.manipulateData(data, action_type );
                    }
                  
                });
            },
            formHandler: function(form){
                var obj = {};
                $(`[data-page="${form}"] [name]`).filter(function(i, o){
                    var name = $(o).attr('name'), val = $(o).val();
                    obj[name] = val;
                });
                return obj;
            },
            formModalHandler: function(form){
                var obj = {};
                $(`[data-innertemplate="${form}"] [name]`).filter(function(i, o){
                    var model = $(o).attr('name'), val = $(o).val(); text = $(o).find('option:selected').html()
                    obj[model] = val;
                  
                });
                return obj;
            },
            manipulateData: function(data, actionType){
                if (actionType == "flight select"){
                    $('#flight_aircraft').html(page.dropdown(data.OUTPUT, 'Aircraft'));
                    $('#flight_pilot').html(page.dropdown(data.TABLE_1, 'Pilot'));
                    $('#flight_destination_id').html(page.dropdown(data.TABLE_0, 'Destination'));
                    $('#flight_origin_id').html(page.dropdown(data.TABLE_0, 'Origin'));
                }
               
                 if (actionType.toUpperCase() == "FIND FLIGHT"){
                    if(data.OUTPUT == undefined){
                        alert('No Available flights recorded.')
                    }else{
                        localStorage.setItem('allflight', JSON.stringify(data));
                        window.location.href = "http://localhost/airline/flight.html";
               
                    }
                 }
                 
            },
            tableModal: function(data, text){
                
                var tbody = '';
                data.forEach(function (o, i) {
                    if (text == "passengers"){
                         tbody += `<tr><td>${o.PASS_GIVEN_NAMES} ${o.PASS_SURNAME}</td><td>${o.PASS_ADDRESS}</td><td>${o.PASS_PASSPORT_NO}</td>
                         <td>${o.PASS_DOB}</td><td>${o.PASS_TELEPHONE}</td>
                         <td>${o.PASS_GENDER}</td> 
                        <td><a class="label label-danger deletepsg" data-id="${i}">Delete</a></td></tr>`
                    }
                });
               
                $('.tableModal tbody').html(tbody);
                page.pageEvents();
            },
            toTitleCase: function(str) {
                str =   (str == null || str== undefined) ? "-": str;
                return str.replace(
                    /\w\S*/g,
                    function(txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    }
                );
            },
            psg_table: function(data){
                var tbody = '';
                data.forEach(function (o, i) {
                    tbody += `<tr><td>${o.PASSPORT_NO}</td><td>${o.PSG_TITLE} ${o.PSG_SURNAME} ${o.PSG_GIVEN_NAME}</td>
                    <td>${o.PSG_ADDRESS}</td><td>${o.PSG_PHONE_NUMBER}</td><td>${o.PSG_EMAIL}</td>
                    <td>${o.PSG_GENDER}</td> <td>${o.PSG_COUNTRY}</td><
                    <td><a class="label label-danger deletepsg" data-id="${i}">Delete</a></td></tr>`
                    
                });
                $('#psg_view tbody').html(tbody);
                page.pageEvents();
            },
            pageEvents : function(){
                $('.edit').click(function () {
                    var text = $(this).data("text");
                    var temp = $(this).data("temp");
                    $edit_id = $(this).data("id");
                    $(`[data-type="${temp}"]`).text("Update");
                    var obj = {}
                    obj[text.toLowerCase()] = $(this).data("id")
                    var $currentdata = _.where($editdata, obj)[0];
                    $(`[data-page="${temp}"] [name]`).filter((i, o) =>{
                        var name = $(o).attr("name");
                        $(`[name="${name}"]`).val($currentdata[name.toLowerCase()])
                    });
                  console.log($currentdata);
                  $('.li_table').removeClass("active")
                $('.li_create').addClass("active")
                $('#home').addClass("active")
                $('#profile').removeClass("active")
                

                });
                $('.delete').click(function () {
                    var arr = {ID : $(this).data("id"), data_type : 'delete'};
                    var $arr = JSON.stringify(arr);
                    chat.server.sp_app_management($arr, $click).done(data => {
                        data = JSON.parse(data);
                        if (data.STATUS == "SUCCESS"){
                            alert(data.RESULT[0].result_no)
                        }
                        page.fetchRecords();
                    });
                    $('input').val("");
                });
                $('.deletepsg').click(function () {
                    var id =  $(this).data("id");
                    passengers.splice(id, 1);
                    page.tableModal(passengers, 'passengers');      
                });
                

                $('[data-type]').off('click').on('click', function(){
                    let form = $(this).data('type');
                    let text =  $(this).text().toLowerCase();
                    var checker =[];
                    $(`[data-page="${form}"] [name]`).filter((i,o) =>{
                        if($(o).val() == ""){ checker.push(1) }
                    });
                    if(checker.length > 0){
                        alert('Some field are Empty!')
                        return false;
                    }
                    let obj = page.formHandler(form);
                    obj["data_type"] ='create';
                    obj["data_type"] = (text == "update") ? "update": "create";
                    if (text == "update"){
                        obj['ID'] =  $edit_id;   
                    }
                    console.log(obj);
                    if($click.toLowerCase() == "flights"){
                        obj.FLIGHT_ARR_TIME = obj.FLIGHT_ARR_DATE + ' '+ obj.FLIGHT_ARR_TIME;
                        obj.FLIGHT_DEPT_TIME = obj.FLIGHT_DEPT_DATE + ' '+ obj.FLIGHT_DEPT_TIME;
                    }
                    if (form == "user register" || form == "user login"){
                        $click = form;
                    }
                    
                    var $arr = JSON.stringify(obj);
                    chat.server.sp_app_management($arr, $click).done(data => {
                        data = JSON.parse(data);
                        console.log(data);
                        if (data.STATUS == "SUCCESS"){
                            alert(data.RESULT[0].result_text);
                            $flight = [];
                            $('input,select').val("");
                        }
                        if ($click == "user register"){
                            window.location.href = 'http://localhost/dolapo_airline/login.html'
                            return false;
                        }
                        if ($click == "user login"){
                            if(data.RESULT[0].result_no == -1){
                                return false
                            }
                            app_storage.setItem('login_type',  JSON.stringify({user_id: data.RESULT[0].user_id, user_type: data.RESULT[0].user_type}))

                            if (data.RESULT[0].user_type == 'admin'){
                                window.location.href = 'http://localhost/dolapo_airline/view/home.html';
                            }else{
                                window.location.href = 'http://localhost/dolapo_airline/view/user.html';
                            }
                            return false;
                        }
                        page.fetchRecords();
                        $('[data-type]').text('Submit')
                      
                    });
                });

                $('[data-addpass]').off('click').on('click', function(){
                    let form = $(this).data('add');
                    passengers.push(page.formModalHandler("passengers"));
                    console.log(passengers);
                    page.tableModal(passengers, "passengers");         
                    $('input, select').val("");
                    page.pageEvents()
                });

              
               
                $('[data-psg]').off('click').on('click', function(){
                    let flight_id = $(this).data('id');
                    localStorage.setItem('flight_id', flight_id);
                    window.location.href = "http://localhost/airline/passenger.html"; 
                });
                $('[data-addpsg]').off('click').on('click', function(){
                    let form = 'passenger', arr = JSON.parse(localStorage.getItem('passengers'));
                    var checker = [];
                    $(`[data-template="${form}"] [data-model]`).filter((i,o) =>{
                        if($(o).val() == ""){ checker.push(1) }
                    });
                    if(checker.length > 0){
                        alert('Empty Fields')
                        return false;
                    }
                    let obj = page.formHandler(form);
                    arr.push(obj);
                    localStorage.setItem('passengers', JSON.stringify(arr));
                    page.psg_table(arr);
                    $('input, select').val('');
                });
           

                $('[data-booking="book"]').off('click').on('click', function(){
                    
                    if(passengers.length == 0){
                        alert("You need to add one or more passengers ")
                        return false;
                    }
                    var $arr = JSON.stringify({PASSENGER: passengers, USER_ID : login_type.user_id, FLIGHT_ID : flight_id, data_type : "create"});
                    console.log($arr);
                    chat.server.sp_app_management($arr, 'book flight').done(data => {
                        data = JSON.parse(data);
                        console.log(data);
                        if (data.STATUS == "SUCCESS"){
                            alert(data.RESULT[0].result_text);
                            passengers = [];
                            page.tableModal([], "passengers");  
                        }
                    });
                });

                
                $('[data-logout]').off('click').on('click', function(){
                    window.location.href = "http://localhost/dolapo_airline/login.html";  
                });

                $('[data-click]').off('click').on('click', function(){
                    let value = $(this).data('click');
                    $('[data-home]').hide();
                    if (value == "Report"){
                        $('[data-home="Report"]').show();
                        $('[data-home="other"]').hide();
                    }else{
                        $('[data-home="Report"]').hide();
                        $('[data-home="other"]').show();
                    }
                    $(`[data-page]`).hide();

                    $(`[data-page='${value.toLowerCase()}']`).show();
                     $(`.page-title`).html(page.toTitleCase(value));
                     $('.tab1-text').html(`Create ${value}`);
                     $('.tab2-text').html(`View ${value} Information`);
                    $click = value.toLowerCase();
                    console.log($click);
                    page.fetchRecords();
                    if($click.toLowerCase() == 'flights'){
                        page.fetcher('', 'flight select');
                    }
                    if($click == 'flights' || $click == "staff" || $click == "machines"){
                        $('.li_create').show();
                        $('.li_table').show();
                    }else{
                        $('.li_create').hide();
                        $('.li_table').show();
                    }
                   
                });

                $('[data-bookid]').off('click').on('click', function(){
                    flight_id = $(this).data('bookid');
                });
            }
        }  
        
    }();
    page.init();  
 });                                