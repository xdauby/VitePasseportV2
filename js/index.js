
async function show_appointment() {
  try {
    console.log('ok')
    const value = await get_appointments();

        const mainContainer = document.getElementById('appt-list');
        mainContainer.innerHTML = '';

        const appointment_sorted = value.sort((a, b) => {
          return new Date(a.date) - new Date(b.date); 
        });

        console.log(appointment_sorted);

        //append header
        var li_header = document.createElement("li");
        li_header.classList.add('table-header');

        var div1_header = document.createElement('div');
        var div2_header = document.createElement('div');
        var div3_header = document.createElement('div');
        var div4_header = document.createElement('div');

        div1_header.classList.add("col", "col-1");
        div2_header.classList.add("col", "col-2");
        div3_header.classList.add("col", "col-3");
        div4_header.classList.add("col", "col-4");

        div1_header.innerText = 'Mairie';
        div2_header.innerText = 'Date';
        div3_header.innerText = 'Heure';
        div4_header.innerText = 'Prendre Rendez-Vous';


        li_header.appendChild(div1_header);
        li_header.appendChild(div2_header);
        li_header.appendChild(div3_header);
        li_header.appendChild(div4_header);

        mainContainer.appendChild(li_header);

        //append each appointment to DOM
        for (cur_townhall of appointment_sorted) {

          var li = document.createElement("li");
          li.classList.add("table-row");

          var div1 = document.createElement('div');
          div1.setAttribute('data-label', 'Mairie');
          div1.classList.add("col", "col-1");
          div1.innerHTML = cur_townhall.townhall;

          var div2 = document.createElement('div');
          div2.setAttribute('data-label', 'Date');
          div2.classList.add("col", "col-2");
          div2.innerHTML = cur_townhall.date;

          var div3 = document.createElement('div');
          div3.setAttribute('data-label', 'Heure');
          div3.classList.add("col", "col-3");
          div3.innerHTML = cur_townhall.hours;

          var div4 = document.createElement('div');
          div4.classList.add("col", "col-4");
          div4.innerHTML = '<a href="' + cur_townhall.appt_link + '"class="btn-appt"'+ 'target="_blank"' +'>rdv</a>';

          li.appendChild(div1);
          li.appendChild(div2);
          li.appendChild(div3);
          li.appendChild(div4);

          mainContainer.appendChild(li);
        }

  } catch (err) {
    const mute = err;
  }
}


async function get_link_to_request() {

  const city_description_url = "https://pro.rendezvousonline.fr/api-web/search-structures/Carte%20Nationale%20d'" + 'Identit%C3%A9%20(CNI)%20et%20Passeport/Gironde,%20France/44.83333/-0.66667?reasons_number={"3":1}&sort=asap&radius=150&page=1&per_page=10';
  
  let townhall_infos = [];

  const res = await fetch(city_description_url)
                        .then(res => res.json() )
                        .then(data => { 
                                        for (const cur_townhall of data.results){
                                            try{
                                            cur_townhall.reason = cur_townhall.reasons.filter(action => action.name == "Dépôt passeport")[0].id;
                                            cur_townhall.available_link = "https://pro.rendezvousonline.fr/api-web/structures/" + cur_townhall.id + '/availabilities/week?session_id=DiCxWuIHufTJkDlVsA23Zpa1p2YFvaviAZN6733Y&reasons={"' + cur_townhall.reason + '":1}';
                                            cur_townhall.appt_link = 'https://rendezvousonline.fr/alias/' + cur_townhall.alias + "/service/Carte%20Nationale%20d'Identit%C3%A9%20(CNI)%20et%20Passeport";
                                            townhall_infos.push((({ id, name, reason, available_link, appt_link }) => ({ id, name, reason, available_link, appt_link }))(cur_townhall));
                                            }catch{}
                                          }
                                          
                                    })
  return await townhall_infos; 
}


async function get_appointments() {

  const townhall_infos = await get_link_to_request();
  console.log(townhall_infos);
  const availabilities_appointment = [];

  for (const cur_townhall of townhall_infos) {
      try {
          const dispo = await fetch(cur_townhall.available_link)
                              .then(res => res.json())
                              .then(data => {
                                  for (const [key, value] of Object.entries(data)) {
                                    if (value.availabilities.length !== 0) {
                                        for (const availabilities of value.availabilities) {
                                            if (availabilities.is_visible == true) {

                                                var entire_date = availabilities.start_at.split(' ');
                                                var date = entire_date[0];
                                                var hours = entire_date[1];
                      
                                                availabilities.appt_link = cur_townhall.appt_link;
                                                availabilities.townhall = cur_townhall.name;
                                                availabilities.date = date;
                                                availabilities.hours = hours;
                      
                                                availabilities_appointment.push((({ date, hours, townhall, appt_link }) => 
                                                                                ({ date, hours, townhall, appt_link }))(availabilities));
                                            }
                                        }
                                      break;
                                    }
                                  } 
                                })       
      }catch{ }
  }
  return await availabilities_appointment;
}

//show appointment list when button is clicked
const btn_appointment = document.getElementById('appointment-btn');
const appt_header = document.getElementById('container');
btn_appointment.addEventListener('click', event => {
  show_appointment();
  //setTimeout(() => {
  //  window.scrollTo(0, 870);
  //}, 2000);
});


