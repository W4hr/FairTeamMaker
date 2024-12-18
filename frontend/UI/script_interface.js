// API URL
const api_address = "http://127.0.0.1:8000";
const login_url = "http://127.0.0.1:8000/login"


// This function checks if a value is a number without any decimal points and is not empty
function isNumericalNoDecimalNotEmpty(value){
    const stringValue = String(value)
    return /^[0-9]+$/.test(stringValue)
}
// This function checks if a value is a number without any decimal points
function isNumericalNoDecimal(value){
    const stringValue = String(value)
    return /^[0-9]*$/.test(stringValue)
}

window.addEventListener("load", () => {
    initializeTabs()
    initializeClearInputButton()
    initializeAddColumnWindow()
    initializeAddRow()
    initializeCheckboxes()

    cancle_add_new_save()

    initializeLoadButton()
    initializeSaveButton()

    change_name_upon_change()
    change_description_upon_change()
    table_player_to_player_toggler_EventListener()

    initializeAddProjectButton()
    initializeLoadProjectInput()
    initializeAnalyzeTabButton()
    initializeAnalyzeButton()
    initializeAddPitchButton()
    initializeNormSettingsButton()
    initializeCustomInputShow()
    initializeDownloadButton()
    initializeNormSettingsCustomWeight()
    initializeToggleNormPair()
    initializeInterchangeableSetting()
    initializeIterationInput()
    initializeResultsSortingOptions()
    initializeContinuousPreviewLoading()
})

function initializeTabs(){
    const tabs = document.querySelectorAll('[data-tab-target]');
    const tab_contents = document.querySelectorAll('[data-tab-content]');
    
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = document.querySelector(tab.dataset.tabTarget)
            tab_contents.forEach(tab_content => {
                tab_content.classList.remove("active_tab")
            })
            target.classList.add("active_tab")
            tabs.forEach(rtab => {
                rtab.classList.remove("active")
            })
            tab.classList.add("active")
        })
    })
}

// action_bool = true -> add class | action_bool = false -> remove class
function batchEditClass(list_ids, class_to_add, action_bool){
    if (action_bool){
        list_ids.forEach(id => {
            document.getElementById(id).classList.add(class_to_add)
        })
    } else{
        list_ids.forEach(id => {
            document.getElementById(id).classList.remove(class_to_add)
        })
    }
}

function initializeClearInputButton(){
    /*clear input file div*/
    document.getElementById("clear_input_button").addEventListener("click", () => {
        document.getElementById("json_import_input").value = '';
    });
}

function initializeAddColumnWindow(){
    /*Add Column Window*/

    const add_column_window = document.getElementById("add_column_window");
    const add_row_window_dimming = document.getElementById("add_row_window_dimming");

    document.getElementById("add_column").addEventListener("click", () => {
        add_column_window.classList.remove("hide");
        add_row_window_dimming.classList.remove("hide");
    })

    document.getElementById("add_column_window_close").addEventListener("click", () => {
        add_column_window.classList.add("hide");
        add_row_window_dimming.classList.add("hide");
    })
    document.getElementById("add_column_window_add").addEventListener("click", () => {
        const add_column_window_min = document.getElementById("add_column_window_min").value;
        const add_column_window_max = document.getElementById("add_column_window_max").value;
        const add_column_window_default_value = document.getElementById("add_column_window_default_value").value;
        const add_column_window_name = document.getElementById("add_column_window_name").value;
        const categorieNames = selected_save_data_edit.categories.map(categorie => categorie.name).join(", ");
        const add_column_window_calc = document.getElementById("add_column_window_calc_type").value

        if (add_column_window_name == "" || !isNumericalNoDecimal(add_column_window_min)|| !isNumericalNoDecimal(add_column_window_max)||!isNumericalNoDecimalNotEmpty(add_column_window_default_value) || selected_save_data_edit == "" || selected_save_data_edit == undefined || categorieNames.includes(add_column_window_name)){
            if (add_column_window_name == ""){
                show_message("You did not define a name for the categorie. Please give the categorie a name before continuing", "warning")
            } else if (!isNumericalNoDecimal(add_column_window_min)){
                show_message("The minimum value for this categorie is not a number or empty. Please remove any deimal points and letters before continuing", "warning")
            } else if (!isNumericalNoDecimal(add_column_window_max)){
                show_message("The maximum value for this categorie is not a number or empty. Please remove any deimal points and letters before continuing", "warning")
            } else if (!isNumericalNoDecimalNotEmpty(add_column_window_default_value)){
                show_message("The default value for this categorie is not a number. Please define the default value or remove any deimal points and letters before continuing", "warning")
            } else if (selected_save_data_edit == "" || selected_save_data_edit == undefined) {
                show_message("You have not selected a project. Before modify anything you must either select a project or create one in the 'Import-Data' Tab")
            } else if (categorieNames.includes(add_column_window_name)){
                show_message("The given categorie name is already used for a different categorie. Please change it.", "warning")
            }
        } else {
            const edit_player_table_topbar = document.getElementById("edit_player_table_topbar");
            const newColumnTop = document.createElement("th");

            newColumnTop.innerText = add_column_window_name;
            edit_player_table_topbar.appendChild(newColumnTop);
            
            const column_number_rows = remove_from_array_with_tag(document.querySelectorAll('#edit_player_table tr'), ["edit_player_table_topbar"]);

            column_number_rows.forEach((column_number_row) => {
                const element = document.createElement("td");
                const child_element = document.createElement("input");
                child_element.setAttribute("min", add_column_window_min);
                child_element.setAttribute("max", add_column_window_max);
                child_element.setAttribute("value", add_column_window_default_value);
                child_element.setAttribute("class", "table_input_number");
                child_element.setAttribute("type", "number");
                
                child_element.addEventListener("change", () => {
                    player_name = child_element.parentElement.parentElement.children[1].children[0].value
                    console.log(player_name);
                    categorie_name = document.getElementById('edit_player_table_topbar').getElementsByTagName('th')[element.cellIndex].innerText;
                    selected_save_data_edit["players"][player_name]["scores"][categorie_name] = parseInt(child_element.value)
                })

                element.appendChild(child_element);
                column_number_row.appendChild(element);
            });

            add_column_window.classList.add("hide");
            add_row_window_dimming.classList.add("hide");

            selected_save_data_edit.categories.push({
                "name": add_column_window_name,
                "standardValue": parseInt(add_column_window_default_value),
                "minimumValue": parseIntButForEmptyString(add_column_window_min),
                "maximumValue": parseIntButForEmptyString(add_column_window_max),
                "calculation": add_column_window_calc
            })
            Object.keys(selected_save_data_edit.players).forEach(player => {
                selected_save_data_edit["players"][player].scores[add_column_window_name] = parseInt(add_column_window_default_value)
            })
            }
    });
}

function parseIntButForEmptyString(value){
    if (value == ""){
        return null
    } else {
        return parseInt(value)
    }
}

function remove_from_array_with_tag(array_of_items, array_of_unwanted_tags) {
    return Array.from(array_of_items).filter((item_from_array) => {
        return !array_of_unwanted_tags.includes(item_from_array.id);
    });
};

function initializeAddRow(){    
    /* Add Row */
    document.getElementById("add_row").addEventListener("click", () => {
        const count_players = document.querySelectorAll('.table_input_name').length
        new_player_name = `Player${count_players+1}`
        const NewRow = document.createElement("tr");
        NewRow.setAttribute("class", "player_data_row");
        NewRow.id = new_player_name

        /*  Attendance Cell  */
        const NewAttendanceCell = document.createElement("td");
        NewAttendanceCell.setAttribute("class", "edit_attendance");
        const NewAttendanceCell_div = document.createElement("div");
        NewAttendanceCell_div.setAttribute("class", "button_activation_attendance");
        NewAttendanceCell_div.addEventListener("click", () => {
            button_activation_attendance.classList.toggle("red_deactivated")
            const player_name = attendance_button.closest("tr").id
            selected_save_data_edit.players[player_name].attendanceState = !selected_save_data_edit.players[player_name].attendanceState
        })
        NewAttendanceCell.appendChild(NewAttendanceCell_div)
        NewRow.appendChild(NewAttendanceCell)

        /*  Name Cell  */
        const NewNameCell = document.createElement("td");
        NewNameCell.setAttribute("class", "edit_name");
        const NewNameCell_textarea = document.createElement("input");
        NewNameCell_textarea.setAttribute("type", "text")
        NewNameCell_textarea.setAttribute("class", "table_input_text");
        NewNameCell_textarea.setAttribute("onclick", "this.select();");
        NewNameCell_textarea.classList.add("table_input_name");
        NewNameCell_textarea.value = new_player_name;
        NewNameCell_textarea.addEventListener("change", () => {
            selected_save_data_edit = update_player_name_upon_change(NewNameCell_textarea)
        })
        NewNameCell.appendChild(NewNameCell_textarea)
        NewRow.appendChild(NewNameCell)

        /* Primery Score */
        const primaryScoreCell = document.createElement("td");
        const primaryScoreCellInput = document.createElement("input");
        primaryScoreCellInput.setAttribute("type", "number");
        primaryScoreCellInput.value = 0;
        primaryScoreCellInput.classList.add("table_input_number");
        primaryScoreCellInput.addEventListener("change", () => {
            update_player_primary_score_upon_change(NewNameCell_textarea, primaryScoreCellInput)
        })
        primaryScoreCell.appendChild(primaryScoreCellInput);
        NewRow.appendChild(primaryScoreCell)

        /*  Number Cells  */ 
        const new_player = {
            [new_player_name]: {
                "attendanceState": true,
                "primaryScore": 0,
                "scores": {}
            }
        };
        for (let i = 0; i < selected_save_data.categories.length; i++) {
            const NewNumberCell = document.createElement("td");
            const NewNumberCell_input = document.createElement("input");
            
            NewNumberCell_input.setAttribute("type", "number"); 
            NewNumberCell_input.setAttribute("class", "table_input_number");
            if (selected_save_data.categories[i].minimumValue !== undefined && selected_save_data.categories[i].minimumValue !== null) {
                NewNumberCell_input.setAttribute("min", selected_save_data.categories[i].minimumValue);
            }
            if (selected_save_data.categories[i].maximumValue !== undefined && selected_save_data.categories[i].maximumValue !== null) {
                NewNumberCell_input.setAttribute("max", selected_save_data.categories[i].maximumValue);
            };
            NewNumberCell_input.setAttribute("value", selected_save_data.categories[i].standardValue );
            NewNumberCell.appendChild(NewNumberCell_input);
            NewRow.appendChild(NewNumberCell)
            new_player[new_player_name]["scores"][selected_save_data.categories[i].name] = Number(NewNumberCell_input.value);
        }
        document.getElementById("edit_player_table").appendChild(NewRow)
        selected_save_data_edit.players[new_player_name] = new_player[new_player_name];

        const PlayerPairPerformance = {}
        PlayerPairPerformance[new_player_name] = {[new_player_name]:0};

        Object.keys(selected_save_data_edit.pairPerformance).forEach(player => {
            PlayerPairPerformance[new_player_name][player] = 0
            selected_save_data_edit["pairPerformance"][player][new_player_name] = 0
        })
        selected_save_data_edit["pairPerformance"][new_player_name] = PlayerPairPerformance[new_player_name]

        NewAttendanceCell_div.addEventListener("click", () => {
            NewAttendanceCell_div.classList.toggle("red_deactivated");
        });
        selected_save_data_edit["number_of_players"] += 1
        build_player_to_player_table(selected_save_data_edit);
    });
};

function update_player_primary_score_upon_change(name_input_field, primary_score_input_field){
    const player_name = name_input_field.value
    selected_save_data_edit["players"][player_name]["primaryScore"] = Number(primary_score_input_field.value)
}

// Preview selected save

var selected_save_data = "";
var selected_save_data_preview = ""
var selected_save_data_edit = ""

async function load_save_preview(selected_save) {
    const name_property_save = document.getElementById("properties_name_input")
    const number_players_property_save = document.getElementById("properties_player_count_input")
    const description_property_save = document.getElementById("properties_notes_input")
    try {
        const response_user_save = await fetch(`${api_address}/user-project-preview/${selected_save.id}`, {
            method: "GET",
            credentials: "include",
        })
        if(!response_user_save.ok){
            throw new Error("Selected Save API request returned not ok: " + response_user_save.detail)
        }

        selected_save_data = await response_user_save.json();
        
        selected_save_data_preview = selected_save_data
        selected_save_data_edit = selected_save_data

        document.getElementById("properties_list_players_list").innerHTML = ""
        Object.keys(selected_save_data.players).forEach(player_name => {
            build_player_preview(selected_save_data, player_name)
        })

        name_property_save.value = selected_save_data["name"]
        number_players_property_save.setAttribute("placeholder", selected_save_data["number_of_players"])
        description_property_save.value = selected_save_data["description"]
        
    } catch (error) {
        console.error("Error in load_save_preview:", error)
    }
}

function table_player_to_player_toggler_EventListener(){
    const table_player_to_player_toggler_was_toggled = "false"
    table_player_to_player_toggler.addEventListener("click", () => {
        table_player_to_player_window.classList.toggle("hide");
        if (!table_player_to_player_toggler_was_toggled) {
            table_player_to_player_toggler_was_toggled = true
        }
    })
}
// Checkboxes customization

function initializeCheckboxes() {
    const checkboxes = document.querySelectorAll(".checkboxes")

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("click", () => {
            checkbox.classList.toggle("checked")
        })
    })
}

async function fetch_saves_preview(skip) {
    try {
        const response_user_saves = await fetch(`${api_address}/user-project-previews?skip=${skip}`, {
            method: "GET",
            credentials: "include"
        });
        if (!response_user_saves.ok) {
            window.location.href = login_url;
            const errorData = await response_user_saves.json();
            throw new Error("Saves API request returned not ok: " + response_user_saves.statusText);
        }
        const response = await response_user_saves.json();
        console.log(`Project previews successfully received`);
        return response;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
}


// Build Saves List
function build_save_item (i, project_previews){
    const save_li_parent = document.createElement("li");
    const save_li_div_parent = document.createElement("div");
    save_li_div_parent.setAttribute("class", "list_saves_item");
    save_li_div_parent.id = project_previews[i].uuid;
    save_li_div_parent.addEventListener("click", () => {
        const list_saves_items = Array.from(document.getElementsByClassName("list_saves_item"))
        list_saves_items.forEach((item) => {
            item.classList.remove("list_saves_item_selected")
        })
        save_li_div_parent.classList.toggle("list_saves_item_selected")
        load_save_preview(save_li_div_parent)
    })

    const save_li_div_input = document.createElement("input");
    save_li_div_input.type = "radio";
    save_li_div_input.name = "saves";
    save_li_div_input.setAttribute("hidden", "hidden")
    save_li_div_input.classList.add("list_saves_item_radio_button");

    const save_li_div_label_parent = document.createElement("label");
    save_li_div_label_parent.classList.add("list_saves_item_label");

    const save_li_div_label_div_parent = document.createElement("div");
    save_li_div_label_div_parent.classList.add("list_save_item_name-and-time-and-indicator");

    const save_li_div_label_div_div = document.createElement("div");
    save_li_div_label_div_div.classList.add("list_save_item_save-reason_indicator");
    save_li_div_label_div_div.style.backgroundColor = project_previews[i].color

    const save_li_div_label_div_div_parent = document.createElement("div");
    save_li_div_label_div_div_parent.classList.add("list_save_item_name-and-time");

    const save_li_div_label_div_div_p_name = document.createElement("p");
    save_li_div_label_div_div_p_name.classList.add("list_save_item_name");
    save_li_div_label_div_div_p_name.textContent = project_previews[i].name;

    const save_li_div_label_div_div_p_date = document.createElement("p");
    save_li_div_label_div_div_p_date.classList.add("list_save_item_date-time");
    save_li_div_label_div_div_p_date.textContent = `${project_previews[i].date} - ${project_previews[i].time}`;

    const save_li_div_p = document.createElement("p");
    save_li_div_p.classList.add("list_save_item_save");
    save_li_div_p.textContent = project_previews[i].save_reason;

    save_li_div_label_div_div_parent.appendChild(save_li_div_label_div_div_p_name);
    save_li_div_label_div_div_parent.appendChild(save_li_div_label_div_div_p_date);

    save_li_div_label_div_parent.appendChild(save_li_div_label_div_div);
    save_li_div_label_div_parent.appendChild(save_li_div_label_div_div_parent);

    save_li_div_label_parent.appendChild(save_li_div_label_div_parent);

    save_li_div_parent.appendChild(save_li_div_input);
    save_li_div_parent.appendChild(save_li_div_label_parent);
    save_li_div_parent.appendChild(save_li_div_p);
    save_li_parent.appendChild(save_li_div_parent);

    document.getElementById("list_saves").appendChild(save_li_parent);
}

function build_save_add(){
    save_li_add = `
        <li>
            <div id="add_new_save">
                <img src="frontend/UI/img/icon/add.svg">
                <p id="add_new_save_text_field">Neues Projekt</p>
            </div>
        </li>
    `;
    document.getElementById("list_saves").innerHTML += save_li_add;
    document.getElementById("add_new_save").addEventListener("click", () => {
        const list_saves_items = Array.from(document.getElementsByClassName("list_saves_item"))
        selected_save_data = ""
        list_saves_items.forEach((button) => {
            button.classList.remove("list_saves_item_selected")
        })
        document.getElementById("add_project_window_dimming").classList.toggle("hide");
        document.getElementById("add_project_window").classList.toggle("hide");
    })
}

function build_save_items(project_previews){
    for (let i = 0; i < project_previews.length; i++) {
        build_save_item(i, project_previews)
    }
}

// Cancle Add Project Window
function cancle_add_new_save() {
    const add_project_window = document.getElementById("add_project_window");
    cancle_add_project_window.addEventListener("click", () => {
        add_project_window_dimming.classList.toggle("hide");
        add_project_window.classList.toggle("hide");
    })
}

// Build list of Players in preview
function build_player_preview(data, player_name){
    // Create Child Elements
    const properties_players_list = document.getElementById("properties_list_players_list")

    const properties_player = document.createElement("li")

    const properties_player_container = document.createElement("div")
    properties_player_container.classList.add("properties_list_player_item")

    const properties_player_indicator = document.createElement("div")
    properties_player_indicator.classList.add("properties_list_player_item_indicator")
    if (!data.players[player_name].attendanceState){
        properties_player_indicator.classList.add("red_deactivated")
    }
    properties_player_indicator.addEventListener("click", () => {
        properties_player_indicator.classList.toggle("red_deactivated")
        selected_save_data_preview.players[player_name].attendanceState = selected_save_data_preview.players[player_name].attendanceState
    })

    const properties_player_name = document.createElement("div")
    properties_player_name.classList.add("properties_list_player_item_identifier")
    properties_player_name.innerText = player_name

    const properties_player_score = document.createElement("div")
    properties_player_score.classList.add("properties_list_player_item_score")
    properties_player_score.innerText = data["players"][player_name]["primaryScore"]

    const properties_player_empty_div = document.createElement("div")

    const properties_player_delete = document.createElement("div")
    properties_player_delete.classList.add("properties_list_player_item_delete")

    const properties_player_delete_symbol = document.createElement("img")
    properties_player_delete_symbol.src = "frontend/UI/img/icon/close2.svg"
    properties_player_delete_symbol.classList.add("properties_list_player_item_delete_img")
    properties_player_delete_symbol.addEventListener("click", () => {
        delete_player(properties_player_container)
        const player_to_delete_name = properties_player_name.innerText
        if (selected_save_data_preview["players"][player_to_delete_name]){
            delete selected_save_data_preview["players"][player_to_delete_name]
            delete selected_save_data_preview.pairPerformance[player_to_delete_name];
            Object.keys(selected_save_data_preview.pairPerformance).forEach(pairPerformancePlayer => {
                delete selected_save_data_preview.pairPerformance[pairPerformancePlayer][player_to_delete_name];
            })
            Object.keys(selected_save_data_preview.teams).forEach(team_name => {
                if (selected_save_data_preview.teams[team_name].players.includes(player_to_delete_name)){
                    const index_player_in_team = selected_save_data_preview.teams[team_name].players.indexOf(player_to_delete_name) // remove player from allocated to teams array
                    selected_save_data_preview.teams[team_name].players.splice(index_player_in_team, 1)
                }
            })
            selected_save_data_preview["number_of_players"] -= 1;
            document.getElementById("properties_player_count_input").setAttribute("placeholder", selected_save_data_preview["number_of_players"])

        }
        else{
            console.error("Player to remove does not exist in the data")
        }
    })

    // Build Children

    properties_player_delete.appendChild(properties_player_delete_symbol)
    properties_player_container.appendChild(properties_player_indicator)
    properties_player_container.appendChild(properties_player_name)
    properties_player_container.appendChild(properties_player_score)
    properties_player_container.appendChild(properties_player_empty_div)
    properties_player_container.appendChild(properties_player_delete)
    properties_player.appendChild(properties_player_container)
    properties_players_list.appendChild(properties_player)
}

function delete_player(player_to_deltete_delete) {
    const player_to_delete = player_to_deltete_delete.closest("li")
    player_to_delete.remove();
}

function add_player_to_team(player_name, player_data, team_players_container, team_name){
    const analyze_pitch_team_player = document.createElement("li")
    analyze_pitch_team_player.classList.add("analyze_pitch_team_player")

    const analyze_pitch_team_player_name = document.createElement("p")
    analyze_pitch_team_player_name.classList.add(`analyze_pitch_team_player_name_${player_name.replace(/ /g, "_")}`)
    analyze_pitch_team_player_name.classList.add(`analyze_pitch_team_player_name`)
    analyze_pitch_team_player_name.innerText = player_name

    const analyze_pitch_team_player_score = document.createElement("p")
    analyze_pitch_team_player_score.classList.add("analyze_pitch_team_player_score")
    analyze_pitch_team_player_score.innerText = player_data.primaryScore

    const analyze_pitch_team_player_delete_container = document.createElement("div")
    analyze_pitch_team_player_delete_container.classList.add("analyze_pitch_team_player_delete")
    const analyze_pitch_team_player_delete = document.createElement("img")
    analyze_pitch_team_player_delete.setAttribute("src", "frontend/UI/img/icon/close2.svg")
    analyze_pitch_team_player_delete.setAttribute("style", "height: 15px;")
    analyze_pitch_team_player_delete_container.addEventListener("click", () => {
        analyze_pitch_team_player.remove()
        document.querySelectorAll(".analyze_results_pitch_team_add_player_selection").forEach(selector => {
            const player_select = document.createElement("option")
            player_select.value = player_name
            player_select.classList.add(`add_player_to_team_${player_name.replace(/ /g, "_")}`)
            player_select.innerText = player_name
            selector.appendChild(player_select)
        })
    })

    analyze_pitch_team_player_delete_container.appendChild(analyze_pitch_team_player_delete)

    analyze_pitch_team_player.appendChild(analyze_pitch_team_player_name)
    analyze_pitch_team_player.appendChild(analyze_pitch_team_player_score)
    analyze_pitch_team_player.appendChild(analyze_pitch_team_player_delete_container)

    team_players_container.appendChild(analyze_pitch_team_player)
    const player_selectors = document.querySelectorAll(`.add_player_to_team_${player_name.replace(/ /g, "_")}`)
    player_selectors.forEach(selector => {
        selector.remove()
    })
}

// Message 

// type_message:
    // - "warning"
    // - "info"
    // - "success"
function show_message(message, type_message){
    const message_box = document.getElementById("message_box");
    if (type_message == "warning"){
        message_box.innerHTML = `<img src="frontend/UI/img/icon/warning.svg" class="message_box_icon"> ${message}`;
        message_box.className = "warning_message show";
    } else if (type_message == "info"){
        message_box.innerHTML = `<img src="frontend/UI/img/icon/info.svg" class="message_box_icon"> ${message}`;
        message_box.className = "show";
    } else if (type_message == "success"){
        message_box.innerHTML = `<img src="frontend/UI/img/icon/check.svg" class="message_box_icon"> ${message}`;
        message_box.className = "success_message show";
    } else {
        console.error("Message type was not proper");
    }
    setTimeout(() => {
        message_box.classList.remove('show');
    }, 5000);
}


// Import Data
// Loading Project

function build_player_table(selected_save_data){
    build_player_table_header(selected_save_data)
    build_player_table_body(selected_save_data)
}

function build_player_table_header(selected_save_data){
    const edit_player_table = document.getElementById("edit_player_table")

    const edit_player_table_topbar = document.createElement("tr")
    edit_player_table_topbar.setAttribute("id", "edit_player_table_topbar")

    const edit_player_table_topbar_attendance = document.createElement("th")
    edit_player_table_topbar_attendance.setAttribute("style", "width:11%")
    edit_player_table_topbar_attendance.innerText = "Attendance"
    
    const edit_player_table_topbar_name = document.createElement("th")
    edit_player_table_topbar_name.setAttribute("style", "width:15%")
    edit_player_table_topbar_name.innerText = "Name of Player"

    const edit_player_table_topbar_skill = document.createElement("th")
    edit_player_table_topbar_skill.innerText = "Skill"

    edit_player_table_topbar.appendChild(edit_player_table_topbar_attendance)
    edit_player_table_topbar.appendChild(edit_player_table_topbar_name)
    edit_player_table_topbar.appendChild(edit_player_table_topbar_skill)
    if (selected_save_data["categories"]){
        selected_save_data["categories"].forEach(categorie => {
            const edit_player_table_topbar_categorie = document.createElement("th")
            edit_player_table_topbar_categorie.innerText = categorie["name"]
            edit_player_table_topbar.appendChild(edit_player_table_topbar_categorie)
        })
    }
    edit_player_table.appendChild(edit_player_table_topbar)
}

function build_player_table_body(selected_save_data){
    const edit_player_table = document.getElementById("edit_player_table")
    Object.keys(selected_save_data["players"]).forEach(player => {
        const edit_player_table_row = document.createElement("tr")
        edit_player_table_row.classList.add("player_data_row")
        edit_player_table_row.id = player

        const edit_player_table_player_attendance = document.createElement("td")
        edit_player_table_player_attendance.classList.add("edit_attendance")

        const edit_player_table_player_attendance_button = document.createElement("div")
        edit_player_table_player_attendance_button.classList.add("button_activation_attendance")
        if (!selected_save_data["players"][player].attendanceState){
            edit_player_table_player_attendance_button.classList.add("red_deactivated")
        }
        edit_player_table_player_attendance_button.addEventListener("click", () => {
            edit_player_table_player_attendance_button.classList.toggle("red_deactivated")
            const player_name = edit_player_table_row.id
            selected_save_data.players[player_name].attendanceState = !selected_save_data.players[player_name].attendanceState
        })

        edit_player_table_player_attendance.appendChild(edit_player_table_player_attendance_button)

        const edit_player_table_player_name = document.createElement("td")
        edit_player_table_player_name.classList.add("edit_name")

        const edit_player_table_player_name_input = document.createElement("input")
        edit_player_table_player_name_input.setAttribute("type", "text")
        edit_player_table_player_name_input.classList.add("table_input_text")
        edit_player_table_player_name_input.classList.add("table_input_name")
        edit_player_table_player_name_input.classList.add(`table_input_name_${player.replace(/ /g, "_")}`)
        edit_player_table_player_name_input.value = player
        edit_player_table_player_name_input.setAttribute("onclick","this.select();")
        edit_player_table_player_name_input.addEventListener("change", () => {
            selected_save_data_edit = update_player_name_upon_change(edit_player_table_player_name_input)
        })

        edit_player_table_player_name.appendChild(edit_player_table_player_name_input)

        const edit_player_table_player_skill = document.createElement("td")
        const edit_player_table_player_skill_input = document.createElement("input")
        edit_player_table_player_skill_input.setAttribute("type", "number")
        edit_player_table_player_skill_input.setAttribute("value", selected_save_data["players"][player].primaryScore)
        edit_player_table_player_skill_input.classList.add("table_input_number")
        edit_player_table_player_skill_input.addEventListener("change", () => {
            update_player_primary_score_upon_change(edit_player_table_player_name_input, edit_player_table_player_skill_input)
        })
        edit_player_table_player_skill.appendChild(edit_player_table_player_skill_input)

        edit_player_table_row.appendChild(edit_player_table_player_attendance)
        edit_player_table_row.appendChild(edit_player_table_player_name)
        edit_player_table_row.appendChild(edit_player_table_player_skill)
        for(let i = 0; i < Object.keys(selected_save_data["players"][player].scores).length; i++){
            const edit_player_table_player_score = document.createElement("td")

            const edit_player_table_player_score_input = document.createElement("input")
            edit_player_table_player_score_input.setAttribute("type", "number")
            edit_player_table_player_score_input.classList.add("table_input_number")
            edit_player_table_player_score_input.value = Object.values(selected_save_data["players"][player].scores)[i]
            edit_player_table_player_score_input.setAttribute("min", selected_save_data["categories"][i].minimumValue)
            edit_player_table_player_score_input.setAttribute("max", selected_save_data["categories"][i].maximumValue)
            edit_player_table_player_score.appendChild(edit_player_table_player_score_input)
            edit_player_table_row.appendChild(edit_player_table_player_score)
        }
    edit_player_table.appendChild(edit_player_table_row)
    })
}

function clear_player_table(){
    const edit_player_table = document.getElementById("edit_player_table")
    edit_player_table.innerHTML = ""
}

function initializeLoadButton(){
    document.getElementById("load_config").addEventListener("click", () => {
        if (selected_save_data == "") {
            show_message("No save selected: Please either select a saved project or create one", "warning")
        } else {
            selected_save_data = selected_save_data_preview
            selected_save_data_edit = selected_save_data_preview
            clear_player_table()
            build_player_table(selected_save_data)
            build_player_to_player_table(selected_save_data)
            apply_settings_analysis(selected_save_data)
            build_pitches(selected_save_data)
            document.querySelector('#import_data_tab').classList.remove("active_tab")
            document.querySelector('[data-tab-target="#import_data_tab"]').classList.remove("active")
            document.querySelector('#edit_data_tab').classList.add("active_tab")
            document.querySelector('[data-tab-target="#edit_data_tab"]').classList.add("active")
        }
    })
}

function change_name_upon_change(){
    const properties_name_input = document.getElementById("properties_name_input")
    properties_name_input.addEventListener("change", () => {
        selected_save_data_preview.name = properties_name_input.value
    })
}

function change_description_upon_change(){
    const properties_notes_input = document.getElementById("properties_notes_input")
    properties_notes_input.addEventListener("change", () => {
        selected_save_data_preview.description = properties_notes_input.value
    })
}

function build_player_to_player_table(selected_save_data){
    document.getElementById("table_player_to_player_thead").innerHTML = ""
    document.getElementById("table_player_to_player_tbody").innerHTML = ""
    build_player_to_player_table_thead(selected_save_data)
    build_player_to_player_table_tbody(selected_save_data)
}

function build_player_to_player_table_thead(selected_save_data){
    const player_to_player_thead = document.getElementById("table_player_to_player_thead")
    const player_to_player_thead_name = document.createElement("tr")

    
    const empty_cell = document.createElement("th")
    empty_cell.setAttribute("style", "width: 15%;")
    player_to_player_thead_name.appendChild(empty_cell)

    Object.keys(selected_save_data.pairPerformance).forEach(player => {
        const player_to_player_thead_playername = document.createElement("th")
        player_to_player_thead_playername.innerText = player
        player_to_player_thead_playername.classList.add("name_cell")
        player_to_player_thead_playername.classList.add(`ptp_head_${player.replace(/ /g, "_")}`)
        player_to_player_thead_name.appendChild(player_to_player_thead_playername)
    })
    player_to_player_thead.appendChild(player_to_player_thead_name)
}

function build_player_to_player_table_tbody(selected_save_data){
    const player_to_player_tbody = document.getElementById("table_player_to_player_tbody")
    const players_pairPerformance = Object.keys(selected_save_data_edit.pairPerformance);
    players_pairPerformance.forEach(player1 => {
        const player_to_player_tbody_player = document.createElement("tr")
        const player_to_player_tbody_player_name = document.createElement("td")
        player_to_player_tbody_player_name.classList.add("name_cell")
        player_to_player_tbody_player_name.classList.add(`ptp_body_${player1.replace(/ /g, "_")}`)
        player_to_player_tbody_player_name.innerText = player1;
        player_to_player_tbody_player.appendChild(player_to_player_tbody_player_name)
        players_pairPerformance.forEach(player2 => {
            const player_to_player_tbody_player_score = document.createElement("td")

            const player_to_player_tbody_player_score_input = document.createElement("input")
            player_to_player_tbody_player_score_input.setAttribute("type", "number")
            player_to_player_tbody_player_score_input.classList.add("table_input_number")
            player_to_player_tbody_player_score_input.classList.add("table_input_number_ptp")
            player_to_player_tbody_player_score_input.addEventListener("change", () => {
                update_player_to_player_upon_change(player_to_player_tbody_player_name, player_to_player_tbody_player_score_input)
            })
            if (player1 === player2){
                player_to_player_tbody_player_score_input.value = 0;
                player_to_player_tbody_player_score_input.setAttribute("disabled", "true")
            } else {
                player_to_player_tbody_player_score_input.value = selected_save_data.pairPerformance[player1][player2]
            }
            
            player_to_player_tbody_player_score.appendChild(player_to_player_tbody_player_score_input)
            player_to_player_tbody_player.appendChild(player_to_player_tbody_player_score)
        })
        player_to_player_tbody.appendChild(player_to_player_tbody_player)
    })
}

function update_player_to_player_upon_change(name_cell, pairPerformance_input_cell) {
    const ptp_table = document.getElementById("table_player_to_player");
    const row = pairPerformance_input_cell.parentElement.parentElement;
    const rowIndex = Array.from(ptp_table.rows).indexOf(row);
    const cellIndex = Array.from(row.cells).indexOf(pairPerformance_input_cell.parentElement);
    ptp_table.rows[cellIndex].cells[rowIndex].querySelector(".table_input_number_ptp").value = pairPerformance_input_cell.value;
    const player1_name = name_cell.innerText;
    const ptp_thead = document.getElementById("table_player_to_player_thead");
    const player2_name = ptp_thead.rows[0].cells[cellIndex].innerText;
    if (
        selected_save_data_edit.pairPerformance[player1_name] &&
        selected_save_data_edit.pairPerformance[player1_name][player2_name] &&
        selected_save_data_edit.pairPerformance[player2_name] &&
        selected_save_data_edit.pairPerformance[player2_name][player1_name]
    ) {
        selected_save_data_edit.pairPerformance[player1_name][player2_name] = Number(pairPerformance_input_cell.value);
        selected_save_data_edit.pairPerformance[player2_name][player1_name] = Number(pairPerformance_input_cell.value);
    } else {
        show_message(`There has been an error applying the changes to ${player1_name} & ${player2_name}.`, "warning");
        console.error(`There has been an error applying the changes to ${player1_name} & ${player2_name}.`);
    }
    console.log(`rowIndex = ${rowIndex}, cellIndex = ${cellIndex}, player1_name = ${player1_name}, player2_name = ${player2_name}, updatedValue = ${pairPerformance_input_cell.value}`);
}

var list_players = []
var list_players_allocated = []

function update_list_players(){
    list_players = Object.keys(selected_save_data_edit.players)
        .filter(player_name => player_name && !list_players_allocated.includes(player_name))
    update_pitches_selectors();
}

function update_team_size_selector(){
    const analyze_pitch_team_num_players_selectors = document.querySelectorAll(".analyze_pitch_team_num_players")
    analyze_pitch_team_num_players_selectors.forEach(selector => {
        selector.innerHTML = `<option value="a">automatic</option>`
        const players_in_team = selector.parentElement.parentElement.children[1].querySelectorAll("li").length
        const possible_max_player_count = players_in_team + list_players.length
        for(let i = 1; i < possible_max_player_count + 1; i++){
            const player_num_option = document.createElement("option")
            player_num_option.setAttribute("value", i)
            player_num_option.innerText = i
            selector.appendChild(player_num_option)
        }
    })
}
//HERE
function update_team_add_players_selector(){
    document.querySelectorAll(".analyze_results_pitch_team_add_player_selection").forEach(selector => {
        selector.innerHTML = ""
        if (list_players.length > 0){
            list_players.forEach(player => {
                const option = document.createElement("option")
                option.setAttribute("value", player)
                option.innerText = player
                selector.appendChild(option)
            })
        } else {
            selector.innerHTML = ""
        }
    })
}

function update_pitches_selectors() {
    if (list_players !== undefined){
        update_team_size_selector()
        update_team_add_players_selector()
    }else{
        console.log("There are no Players, so the selection will stay empty", list_players)
    }
}

function initializeDownloadButton(){
    document.getElementById("download_button").addEventListener("click", () => {
        if (selected_save_data_edit == ""){
            show_message("Project is empty. Please load a project first.","warning")
        } else{
            const project = get_project_json(selected_save_data_edit)
            let dl = document.createElement("a")
            dl.download = `${project.name}.json`
            dl.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(project))}`
            dl.click()
        }
    })
}

function initializeLoadProjectInput(){
    const import_data_input = document.getElementById("json_import_input")
    import_data_input.addEventListener("change", () => {
        const file = import_data_input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    selected_save_data = JSON.parse(event.target.result);
                    const name_property_save = document.getElementById("properties_name_input");
                    const number_players_property_save = document.getElementById("properties_player_count_input");
                    const description_property_save = document.getElementById("properties_notes_input");
    
                    name_property_save.value = selected_save_data["name"];
                    number_players_property_save.setAttribute("placeholder", selected_save_data["number_of_players"]);
                    description_property_save.value = selected_save_data["description"];
    
                    document.getElementById("properties_list_players_list").innerHTML = ""
                    Object.keys(selected_save_data.players).forEach(player_name => {
                        build_player_preview(selected_save_data, player_name)
                    })
    
                    selected_save_data_preview = selected_save_data;
                    selected_save_data_edit = selected_save_data;
                } catch (e) {
                    console.error("Error parsing JSON: ", e);
                }
            };
            reader.readAsText(file);
        }
    });
}

// New Project Button
function initializeAddProjectButton(){
    const default_new_project = {
        "name": "Project Name",
        "description": "Project Description",
        "color": "#3B8E5D",
        "number_of_players": 2,
        "matches": {},
        "pitches": ["Pitch 1"],
        "teams": {
            "Team 1": {
                "num_players": null,
                "players": []
            },
            "Team 2": {
                "num_players": null,
                "players": []
            }
        },
        "settings": {
            "interchangeableTeams": true,
            "maxSittingOut": 2,
            "maxDifferenceTeams": 2,
            "maxDifferencePitches": 2,
            "auto_save": false,
            "count_iterations": 10000,
            "algorithmChoice": "random",
            "normalizationSettings": {
                "NormSettingsPrimaryScore": {
                    "status": true,
                    "type": "logit",
                    "minValue": "symmetric",
                    "minValueCustom": 0,
                    "maxValue": "symmetric",
                    "maxValueCustom": 10,
                    "minValueOutput": "automatic",
                    "minValueOutputCustom": 1,
                    "maxValueOutput": "automatic",
                    "maxValueOutputCustom": 3
                },
                "NormSettingsPairPerformance": {
                    "status": true,
                    "type": "logit",
                    "minValue": "symmetric",
                    "minValueCustom": 0,
                    "maxValue": "symmetric",
                    "maxValueCustom": 10,
                    "minValueOutput": "weight",
                    "minValueOutputCustom": 0.5,
                    "maxValueOutput": "weight",
                    "maxValueOutputCustom": 1.5,
                    "weight": "custom",
                    "weightCustom": 0.4
                }
            }
        },
        "categories": [],
        "players": {
            "player 1": {
                "attendanceState": true,
                "primaryScore": 0,
                "scores": {}
            },
            "player 2": {
                "attendanceState": true,
                "primaryScore": 0,
                "scores": {}
            }
        },
        "pairPerformance": {
            "player 1": {
                "player 1": 0,
                "player 2": 1
            },
            "player 2": {
                "player 1": 1,
                "player 2": 0
            }
        }
    };
    
    document.getElementById("add_project").addEventListener("click", () => {
        default_new_project["name"] = document.getElementById("add_project_name_input").value;
        if (document.getElementById("add_project_autosave_option").classList.contains("checked")){
            default_new_project["settings"]["auto_save"] = "True"
        }
        default_new_project["description"] = document.getElementById("add_project_description_input").value;
        default_new_project["color"] = document.getElementById("project_color_input").value
        selected_save_data = default_new_project
        selected_save_data_preview = default_new_project

        const name_property_save = document.getElementById("properties_name_input");
        const number_players_property_save = document.getElementById("properties_player_count_input");
        const description_property_save = document.getElementById("properties_notes_input");

        name_property_save.value = selected_save_data_preview["name"];
        number_players_property_save.setAttribute("placeholder", selected_save_data_preview["number_of_players"]);
        description_property_save.value = selected_save_data_preview["description"];

        document.getElementById("properties_list_players_list").innerHTML = ""
        Object.keys(selected_save_data_preview.players).forEach(player_name => {
            build_player_preview(selected_save_data_preview, player_name)
    })

        document.getElementById("add_project_window_dimming").classList.toggle("hide");
        document.getElementById("add_project_window").classList.toggle("hide");
        selected_save_data = selected_save_data_preview
    })
}


function get_project_json(project){
    const cleaned_project = clean_project_teams_matches_pitches(project)
    const analyze_project_settings = gather_project_data_settings(cleaned_project)
    const analyze_project = gather_project_data_teams_matches(analyze_project_settings)
    const normSettings = gather_project_data_norm_settings(analyze_project)

    if(normSettings){
        analyze_project.settings.normalizationSettings = normSettings
    } else {
        return false
    }
    return analyze_project
}

function clean_project_teams_matches_pitches(project){
    project.teams = {}
    project.matches = {}
    project.pitches = {}
    return project
}

function gather_project_data_settings(project){
    project.settings.maxSittingOut = parseInt(document.getElementById("analyze_settings_max_sit_out_players").value)
    project.settings.maxDifferenceTeams = parseInt(document.getElementById("analyze_settings_max_difference_teams").value)
    project.settings.maxDifferencePitches = parseInt(document.getElementById("analyze_settings_max_difference_pitches").value)
    project.settings.algorithmChoice = document.getElementById("analyze_settings_algorithm_choice").value
    project.settings.interchangeableTeams = document.getElementById("analyze_settings_interchangeable_toggle").checked
    project.settings.count_iterations = parseInt(document.getElementById("analyze_settings_iteration_range").value)
    return project
}

function gather_project_data_teams_matches(project){

    // extract which players are allocated to which team and set the set teams size
    const analyze_tab = document.getElementById("analysis_tab")
    analyze_tab.querySelectorAll(".analyze_pitch_team").forEach(team_box => {
        project.teams[team_box.querySelector(".analyze_pitch_team_title_input").value] = {
            "num_players": (() => {
                const selectedValue = team_box.querySelector(".analyze_pitch_team_num_players").value;
                return selectedValue === "a" ? null : selectedValue;
            })(),
            "players": Array.from(team_box.querySelectorAll(".analyze_pitch_team_player_name")).map(player_name => player_name.innerText)
        }
    })
    // Make team matchup
    const team_names = Array.from(analyze_tab.querySelectorAll(".analyze_pitch_team_title_input")).map(team_box => team_box.value)
    for (let i = 0; i < team_names.length; i += 2){
        project.matches[team_names[i]] = team_names[i+1]
    }
    const pitches_names = Array.from(document.querySelectorAll(".analyze_pitch_title_input")).map(pitch_name_textbox => pitch_name_textbox.value)
    project["pitches"] = pitches_names
    return project
    
}

function verify_project(project){
    const [players_valid, players_names] = verify_project_players(project)
    if (players_valid){
        if (verify_categories(project)){
            if (verify_settings(project)){
                if (verifyPlayerRelationships(project, players_names)){
                    if (verify_teams_and_matches(project)){
                        show_message("The project data is valid and will be processed", "success")
                        return true
                    }
                }
            }
        }
    }
    console.log(`Failed data: ${JSON.stringify(project)}`)
    return false
}

function verify_project_players(project){
    const players = project["players"]
    let player_counter = 0;
    const players_invalid_primary_score = []
    let player_count_invalid_primary_score = 0
    const players_names = []
    Object.keys(players).forEach(player_name => {
        if (typeof(players[player_name].primaryScore) !== "number"){
            players_invalid_primary_score.push(player_name);
            player_count_invalid_primary_score ++;
        }
        players_names.push(player_name)
        player_counter += 1;
    })
    if (player_count_invalid_primary_score > 1){
        show_message(`The players ${players_invalid_primary_score} have invalid primary scores. Make sure that the primary score of those players is a number.`, "warning")
        console.error(`The players ${players_invalid_primary_score} have invalid primary scores. Make sure that the primary score of those players is a number.`)
        return false
    } else if (player_count_invalid_primary_score == 1){
        show_message(`The player ${players_invalid_primary_score} has an invalid primary score. Make sure that the primary score of ${players_invalid_primary_score} is a number.`, "warning")
        console.error(`The player ${players_invalid_primary_score} has an invalid primary score. Make sure that the primary score of ${players_invalid_primary_score} is a number.`)
        return false
    } else if (player_count_invalid_primary_score == 0){
    } else {
        show_message("There has been an unknown error during validation of your project's data. Please try again.", "warning")
        console.error("There has been an unknown error during validation of your project's data. Please try again.")
        return false
    }
    if (player_counter != project["number_of_players"]){
        show_message("The amount of players with data does not match the number of players. This will be fixed automatically", "info")
        console.log(`The amount of players with data does not match the number of players. This will be fixed automatically. number_of_players: ${project["number_of_players"]} - player in players: ${player_counter}`)
        return false
    }
    return [true, players_names]
}

function verify_categories(project){
    const categories = project["categories"]
    const players = project["players"]

    let player_count_missing_categories = 0
    let players_too_small_or_too_large_category_scores = [] // Remove duplicates
    let player_count_too_small_or_too_large_category_scores = 0

    categories.forEach(category => {
        Object.keys(players).forEach(player_name => {
            if (!project.players[player_name].scores[category.name] || typeof(project.players[player_name].scores[category.name]) != "number"){
                player_count_missing_categories ++;
            } else if (typeof(category.minimumValue) == "number") {
                if (project.players[player_name].scores[category.name] < category.minimumValue){
                    players_too_small_or_too_large_category_scores.push(player_name)
                    player_count_too_small_or_too_large_category_scores ++;
                } else if (typeof(category.maximumValue) == "number"){
                    if (project.players[player_name].scores[category.name] > category.maximumValue){
                        players_too_small_or_too_large_category_scores.push(player_name)
                        player_count_too_small_or_too_large_category_scores ++;
                    }
                }
            }
        })
    })
    if (player_count_missing_categories > 0){
        show_message("Values for some categories for some players are either missing or are not a number", "warning")
        console.error("Values for some categories for some players are either missing or are not a number")
        return false
    }

    if (player_count_too_small_or_too_large_category_scores > 0){
        show_message(`The players ${players_too_small_or_too_large_category_scores} have either too large or too small scores in one or more categories`, "warning")
        console.error(`The players ${players_too_small_or_too_large_category_scores} have either too large or too small scores in one or more categories`)
        return false
    }
    return true
}

function verify_settings(project){
    const settings = project["settings"]

    if (typeof(settings.interchangeableTeams) != "boolean"){
        show_message("The 'interchangeable Teams' option is neither on nor off. Please tick this setting off or on to fit your needs.", "warning")
        console.error("The 'interchangeable Teams' option is neither on nor off. Please tick this setting off or on to fit your needs.")
        return false
    }

    if (typeof(settings.maxSittingOut) != "number" || settings.maxSittingOut < 0){
        show_message("The input for the maximum amount of players sitting out is either not a number or is smaller than 0", "warning")
        console.error("The input for the maximum amount of players sitting out is either not a number or is smaller than 0")
        return false
    }

    if (typeof(settings.maxDifferenceTeams) != "number" || settings.maxDifferenceTeams < 0){
        show_message("The input for the maximum difference in amount of players between teams option is either not a number or is smaller than 0", "warning")
        console.error("The input for the maximum difference in amount of players between teams option is either not a number or is smaller than 0")
        return false
    }

    if (typeof(settings.maxDifferencePitches) != "number" || settings.maxDifferencePitches < 0){
        show_message("The input for the maximum difference in amount of players between pitches option is either not a number or is smaller than 0", "warning")
        console.error("The input for the maximum difference in amount of players between pitches option is either not a number or is smaller than 0")
        return false
    }

    if (typeof(settings.algorithmChoice) != "string" && settings.algorithmChoice != "random" && settings.algorithmChoice != "brute_force"){
        show_message("The algorithm choice is not valid. Make sure its you choose one of the options", "warning")
        console.error("The algorithm choice is not valid. Make sure its you choose one of the options")
        return false
    }

    if (typeof(settings.auto_save) != "boolean"){
        show_message("The 'auto_save' option is neither on nor off. Please tick this setting off or on to fit your needs.", "warning")
        console.error(`The 'auto_save' option is neither on nor off. Please tick this setting off or on to fit your needs. auto_save = ${settings.auto_save}: ${typeof settings.auto_save}`)
        return false
    }

    if (!verify_norm_settings(project.settings.normalizationSettings)){
        return false
    }

    return  true
}

function verifyPlayerRelationships(project, playerNames) {
    const pairPerformanceData = project["pairPerformance"];

    const missingPlayersInPairPerformance = [];
    let missingPlayersCountInPairPerformance = 0;

    let missingPairsInPlayerPerformance = [];
    let missingPairsCountInPlayerPerformance = 0;

    const invalidPairsInPlayerPerformance = [];
    let invalidPairsCountInPlayerPerformance = 0;

    playerNames.forEach(playerName => {
        if (!pairPerformanceData[playerName]) {
            missingPlayersInPairPerformance.push(playerName);
            missingPlayersCountInPairPerformance++;
        } else {
            playerNames.forEach(pairPlayerName => {
                if (pairPerformanceData[playerName][pairPlayerName] === undefined || pairPerformanceData[playerName][pairPlayerName] === null) {
                    console.log(`Missing pair relationship: ${playerName} - ${pairPlayerName}: ${pairPerformanceData[playerName][pairPlayerName]}`);
                    missingPairsInPlayerPerformance.push(playerName);
                    missingPairsInPlayerPerformance.push(pairPlayerName);
                    missingPairsCountInPlayerPerformance++;
                } else if (typeof(pairPerformanceData[playerName][pairPlayerName]) != "number") {
                    console.log(`Invalid pair relationship value: ${playerName} - ${pairPlayerName}`);
                    invalidPairsInPlayerPerformance.push(playerName);
                    invalidPairsInPlayerPerformance.push(pairPlayerName);
                    invalidPairsCountInPlayerPerformance++;
                }
            });
        }
    });

    if (missingPlayersInPairPerformance.length > 0) {
        show_message(`The players ${missingPlayersInPairPerformance} are missing from the pairPerformanceData. Assure that they have a relationship status.`, "warning");
        console.error(`The players ${missingPlayersInPairPerformance} are missing from the pairPerformanceData. Assure that they have a relationship status.`);
        return false;
    }
    if (missingPairsInPlayerPerformance.length > 0) {
        show_message(`The players ${[...missingPairsInPlayerPerformance]} do not have a value representing their relationship`, "warning");
        console.error(`The players ${[...missingPairsInPlayerPerformance]} do not have a value representing their relationship`);
        return false;
    }
    if (invalidPairsInPlayerPerformance.length > 0) {
        show_message(`The players ${[...invalidPairsInPlayerPerformance]} have an invalid pair relationship value`, "warning");
        console.error(`The players ${[...invalidPairsInPlayerPerformance]} have an invalid pair relationship value`);
        return false;
    }

    return true;
}


function verify_teams_and_matches(project){
    const teams = project.teams
    const matches = project.matches
    const players = project.players

    const teams_names = []
    const teams_invalid_num_players = []
    let count_teams_invalid_num_players = 0;

    const teams_unknown_player_allocation = []
    let count_teams_unknown_player_allocation = 0

    Object.keys(teams).forEach(team_name => {
        teams_names.push(team_name)
        if (project.teams[team_name]["num_players"] != null && typeof(project.teams[team_name]["num_players"]) != "number"){
            teams_invalid_num_players.push(team_name)
            count_teams_invalid_num_players ++
        }
        project.teams[team_name]["players"].forEach(player_name =>{
            if (!players[player_name]){
                teams_unknown_player_allocation.push(player_name)
                count_teams_unknown_player_allocation ++
            }
        })
    })

    let unknown_team_in_matches = []
    let count_unknown_team_in_matches = 0

    const inversed_matches = Object.fromEntries(Object.entries(matches).map(([keys, values]) => [values, keys]))
    const validation_matches = Object.assign({}, matches, inversed_matches)
    teams_names.forEach(team_name => {
        if (!validation_matches[team_name] || !teams[validation_matches[team_name]]){
            unknown_team_in_matches.push(team_name)
            count_unknown_team_in_matches ++
        }
    })


    if (count_teams_invalid_num_players > 0){
        show_message(`The teams ${teams_invalid_num_players} have an invalid value for their team size. Make sure the team size is either not set or set to a number`, "warning")
        console.error(`The teams ${teams_invalid_num_players} have an invalid value for their team size. Make sure the team size is either not set or set to a number`)
        return false
    }
    if (count_teams_unknown_player_allocation > 0){
        show_message(`To the teams ${teams_unknown_player_allocation} players not in the project were allocated. Make sure all players allocated to a team are also present in the project`, "warning")
        console.error(`To the teams ${teams_unknown_player_allocation} players not in the project were allocated. Make sure all players allocated to a team are also present in the project`)
        return false
    }
    if (count_unknown_team_in_matches > 0){
        show_message(`The teams ${unknown_team_in_matches} either do not exist or their opponent does not exist. Make sure the teams are named properly`, "warning")
        console.error(`The teams ${unknown_team_in_matches} either do not exist or their opponent does not exist. Make sure the teams are named properly`)
        return false
    }
    return true
}

function verify_norm_settings(norm_settings) {
    function helper_verify_norm(norm_status, norm_type, minValue, maxValue, minValueCustom, maxValueCustom, minValueOutput, maxValueOutput, minValueOutputCustom, maxValueOutputCustom, normSettings) {
        if (typeof norm_status !== "boolean") {
            show_message(`The ${normSettings} toggle is invalid. Make sure it's either on or off.`);
            console.error(`The ${normSettings} toggle is invalid. norm_status = ${norm_status}: ${typeof norm_status}`);
            return false
        }
        switch (norm_type) {
            case "logit":
            case "sigmoid":
            case "linear":
                break;
            default:
                show_message(`The ${normSettings} normalization type is invalid. Make sure you've selected one of the options.`, "warning");
                console.error(`The ${normSettings} normalization type is invalid. norm_type = ${norm_type}: ${typeof norm_type}`);
                return false;
        }
        switch (minValue) {
            case "smallest_value":
            case "largest_value":
            case "symmetric":
                break;
            case "custom":
                if (typeof minValueCustom !== "number") {
                    show_message(`The custom minimum value of the ${normSettings} normalization settings is invalid. Make sure you've put in a valid number.`, "warning");
                    show_message(`The custom minimum value of the ${normSettings} normalization settings is invalid. minValueCustom = ${minValueCustom}: ${typeof minValueCustom}`);
                    return false;
                }
                break;
            default:
                show_message(`The selected minimum value of the ${normSettings} normalization settings is invalid. Make sure you've selected one of the options.`, "warning");
                show_message(`The selected minimum value of the ${normSettings} normalization settings is invalid. minValue = ${minValue}: ${typeof minValue}`);
                return false;
        }
        switch (maxValue) {
            case "smallest_value":
            case "largest_value":
            case "symmetric":
                break
            case "custom":
                if (typeof maxValueCustom !== "number") {
                    show_message(`The custom maximum value of the ${normSettings} normalization settings is invalid. Make sure you've put in a valid number.`, "warning");
                    show_message(`The custom maximum value of the ${normSettings} normalization settings is invalid. maxValueCustom = ${maxValueCustom}: ${typeof maxValueCustom}`);
                    return false;
                }
                break;
            default:
                show_message(`The selected maximum value of the ${normSettings} normalization settings is invalid. Make sure you've selected one of the options.`, "warning");
                show_message(`The selected maximum value of the ${normSettings} normalization settings is invalid. maxValue = ${maxValue}: ${typeof maxValue}`);
                return false;
        }
        // Output Value
        switch (minValueOutput) {
            case "automatic":
            case "weight":
                break;
            case "custom":
                if (typeof minValueOutputCustom !== "number") {
                    show_message(`The custom smallest output value of the ${normSettings} normalization settings is invalid. Make sure you've put in a valid number.`, "warning");
                    show_message(`The custom smallest output value of the ${normSettings} normalization settings is invalid. minValueOutputCustom = ${minValueOutputCustom}: ${typeof minValueOutputCustom}`);
                    return false;
                }
                break;
            default:
                show_message(`The selected smallest output value of the ${normSettings} normalization settings is invalid. Make sure you've selected one of the options.`, "warning");
                show_message(`The selected smallest output value of the ${normSettings} normalization settings is invalid. minValueOutput = ${minValueOutput}: ${typeof minValueOutput}`);
                return false;
        }
        switch (maxValueOutput) {
            case "automatic":
            case "weight":
                break;
            case "custom":
                if (typeof maxValueOutputCustom !== "number") {
                    show_message(`The custom largest output value of the ${normSettings} normalization settings is invalid. Make sure you've put in a valid number.`, "warning");
                    show_message(`The custom largest output value of the ${normSettings} normalization settings is invalid. maxValueOutputCustom = ${maxValueOutputCustom}: ${typeof maxValueOutputCustom}`);
                    return false;
                }
                break;
            default:
                show_message(`The selected largest output value of the ${normSettings} normalization settings is invalid. Make sure you've selected one of the options.`, "warning");
                show_message(`The selected largest output value of the ${normSettings} normalization settings is invalid. maxValueOutput = ${maxValueOutput}: ${typeof maxValueOutput}`);
                return false;
        }
        return true
    }

    const typeNormSettingsPrimaryScore = norm_settings["NormSettingsPrimaryScore"]["type"];
    const statusNormSettingsPrimaryScore = norm_settings["NormSettingsPrimaryScore"]["status"];
    const minNormSettingsPrimaryScore = norm_settings["NormSettingsPrimaryScore"]["minValue"];
    const minCustomNormSettingsPrimaryScore = norm_settings["NormSettingsPrimaryScore"]["minValueCustom"];
    const maxNormSettingsPrimaryScore = norm_settings["NormSettingsPrimaryScore"]["maxValue"];
    const maxCustomNormSettingsPrimaryScore = norm_settings["NormSettingsPrimaryScore"]["maxValueCustom"];
    const minOutputNormSettingsPrimaryScore = norm_settings["NormSettingsPrimaryScore"]["minValueOutput"];
    const maxOutputNormSettingsPrimaryScore = norm_settings["NormSettingsPrimaryScore"]["maxValueOutput"];
    const minCustomOutputNormSettingsPrimaryScore = norm_settings["NormSettingsPrimaryScore"]["minValueOutputCustom"];
    const maxCustomOutputNormSettingsPrimaryScore = norm_settings["NormSettingsPrimaryScore"]["maxValueOutputCustom"];
    if (!helper_verify_norm(statusNormSettingsPrimaryScore, typeNormSettingsPrimaryScore, minNormSettingsPrimaryScore, maxNormSettingsPrimaryScore, minCustomNormSettingsPrimaryScore, maxCustomNormSettingsPrimaryScore, minOutputNormSettingsPrimaryScore, maxOutputNormSettingsPrimaryScore, minCustomOutputNormSettingsPrimaryScore, maxCustomOutputNormSettingsPrimaryScore, "primary score")){
        console.error("Something is wrong with the primary score normalization")
        return false
    }

    const typeNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["type"];
    const statusNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["status"];
    const minNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["minValue"];
    const minCustomNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["minValueCustom"];
    const maxNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["maxValue"];
    const maxCustomNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["maxValueCustom"];
    const minOutputNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["minValueOutput"];
    const maxOutputNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["maxValueOutput"];
    const minCustomOutputNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["minValueOutputCustom"];
    const maxCustomOutputNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["maxValueOutputCustom"];
    if (!helper_verify_norm(statusNormSettingsPairPerformance, typeNormSettingsPairPerformance, minNormSettingsPairPerformance, maxNormSettingsPairPerformance, minCustomNormSettingsPairPerformance, maxCustomNormSettingsPairPerformance, minOutputNormSettingsPairPerformance, maxOutputNormSettingsPairPerformance, minCustomOutputNormSettingsPairPerformance, maxCustomOutputNormSettingsPairPerformance, "pair performance")){
        console.error("Something is wrong with the pair performance normalization")
        return false
    }

    const weightNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["weight"]
    const weightCustomNormSettingsPairPerformance = norm_settings["NormSettingsPairPerformance"]["weightCustom"]

    switch(weightNormSettingsPairPerformance){
        case "automatic":
            break
        case "custom":
            if (typeof weightCustomNormSettingsPairPerformance !== "number"){
                show_message(`The custom weight value of the pair performance normalization settings is invalid. Make sure you've put in a valid number.`, "warning")
                show_message(`The custom weight value of the pair performance normalization settings is invalid. weightCustomNormSettingsPairPerformance = ${weightCustomNormSettingsPairPerformance}: ${typeof weightCustomNormSettingsPairPerformance}`)
                return false
            }
            else{
                break
            }
    }
    return true
}

function getValidNumber(element_value){
    const element_value_number = Number(element_value)
    if (isNaN(element_value_number)){
        return element_value
    } else{
        return element_value_number
    }
}

function gather_project_data_norm_settings(data){
    const NormSettingsPrimaryScore = {}
    
    NormSettingsPrimaryScore["status"] = document.getElementById("normalization_primary_toggle").checked
    NormSettingsPrimaryScore["type"] = document.getElementById("normalization_primary_score_type").value
    NormSettingsPrimaryScore["minValue"] = document.getElementById("normalization_primary_score_min").value
    NormSettingsPrimaryScore["maxValue"] = document.getElementById("normalization_primary_score_max").value
    NormSettingsPrimaryScore["minValueOutput"] = document.getElementById("normalization_primary_score_min_output").value
    NormSettingsPrimaryScore["maxValueOutput"] = document.getElementById("normalization_primary_score_max_output").value

    NormSettingsPrimaryScore["minValueCustom"] = getValidNumber(document.getElementById("normalization_primary_score_min_custom").value)
    NormSettingsPrimaryScore["maxValueCustom"] = getValidNumber(document.getElementById("normalization_primary_score_max_custom").value)
    NormSettingsPrimaryScore["minValueOutputCustom"] = getValidNumber(document.getElementById("normalization_primary_score_min_output_custom").value)
    NormSettingsPrimaryScore["maxValueOutputCustom"] = getValidNumber(document.getElementById("normalization_primary_score_max_output_custom").value)

    const NormSettingsPairPerformance = {}

    NormSettingsPairPerformance["status"] = document.getElementById("normalization_pair_toggle").checked
    NormSettingsPairPerformance["type"] = document.getElementById("normalization_pair_score_type").value
    NormSettingsPairPerformance["minValue"] = document.getElementById("normalization_pair_score_min").value
    NormSettingsPairPerformance["maxValue"] = document.getElementById("normalization_pair_score_max").value
    NormSettingsPairPerformance["minValueOutput"] = document.getElementById("normalization_pair_score_min_output").value
    NormSettingsPairPerformance["maxValueOutput"] = document.getElementById("normalization_pair_score_max_output").value
    NormSettingsPairPerformance["weight"] = document.getElementById("normalization_settings_weight").value

    NormSettingsPairPerformance["minValueCustom"] = getValidNumber(document.getElementById("normalization_pair_score_min_custom").value)
    NormSettingsPairPerformance["maxValueCustom"] = getValidNumber(document.getElementById("normalization_pair_score_max_custom").value)
    NormSettingsPairPerformance["minValueOutputCustom"] = getValidNumber(document.getElementById("normalization_pair_score_min_output_custom").value)
    NormSettingsPairPerformance["maxValueOutputCustom"] = getValidNumber(document.getElementById("normalization_pair_score_max_output_custom").value)
    NormSettingsPairPerformance["weightCustom"] = getValidNumber(document.getElementById("normalization_settings_weight_custom").value)
    
    // Verify valid norm config
    // Primary Score
    if (NormSettingsPrimaryScore["type"] == "logit" && NormSettingsPrimaryScore["minValue"] == "custom" || NormSettingsPrimaryScore["maxValue"] == "custom"){
        if (NormSettingsPrimaryScore["minValue"] == "custom" && NormSettingsPrimaryScore["maxValue"] == "custom"){
            for (let player_data of Object.values(data["players"])){
                if (player_data["primaryScore"] < NormSettingsPrimaryScore["minValueCustom"] || player_data["primaryScore"] > NormSettingsPrimaryScore["maxValueCustom"]){
                    show_message("The minimum normalization value cannot be larger then the smallest primary score and the maximum normalization value cannot be smaller then the largest value of the primary scores. Make sure they are within bounds.", "warning")
                    console.error(`The minValue or the maxValue of the normalization settings are smaller or larger then either the largest or smallest value in the primary score: \n minValue = ${minValueCustom} | maxValue = ${maxValueCustom}`)
                    return false
                }
            }
        } else if (NormSettingsPrimaryScore["minValue"] == "custom"){
            for (let player_data of Object.values(data["players"])){
                if (player_data["primaryScore"] < NormSettingsPrimaryScore["minValueCustom"]){
                    show_message("The minimum normalization value is larger the the smallest primary score. Make sure the minimum value is either equal or smaller then the smallest primary score.")
                    console.error(`The minValue is larger then the smallest primary score: \n minValue = ${minValueCustom}`)
                    return false
                }
            }
        } else if (NormSettingsPrimaryScore["maxValue"] == "custom"){
            for (let player_data of Object.values(data["players"])){
                if (player_data["primaryScore"] > NormSettingsPrimaryScore["maxValueCustom"]){
                    show_message("The maximum normalization value is smaller the the largest primary score. Make sure the maximum value is either greater or equal to then the largest primary score.")
                    console.error(`The maxValue is smaller then the largest primary score: \n minValue = ${maxValueCustom}`)
                    return false
                }
            }
        }
    }
    // PairPerformance
    if (NormSettingsPairPerformance["type"] == "logit" && NormSettingsPairPerformance["minValue"] == "custom" || NormSettingsPairPerformance["maxValue"] == "custom"){
        if (NormSettingsPairPerformance["minValue"] == "custom" && NormSettingsPairPerformance["maxValue"] == "custom"){
            for (let player1 in data["pairPerformance"]){
                for (let pairScore of Object.values(data["pairPerformance"][player1])){
                    if (pairScore < NormSettingsPairPerformance["minValueCustom"] || pairScore > NormSettingsPairPerformance["maxValueCustom"]){
                        show_message("The minimum normalization value cannot be larger then the smallest primary score and the maximum normalization value cannot be smaller then the largest value of the primary scores. Make sure they are within bounds.", "warning")
                        console.error(`The minValue or the maxValue of the normalization settings are smaller or larger then either the largest or smallest value in the primary score: \n minValue = ${minValueCustom} | maxValue = ${maxValueCustom}`)
                        return false
                    }
                }
            }
        } else if (NormSettingsPairPerformance["minValue"] == "custom"){
            for (let player1 in data["pairPerformance"]){
                for (let pairScore of Object.values(data["pairPerformance"][player1])){
                    if (pairScore < NormSettingsPairPerformance["minValueCustom"] ){
                        show_message("The minimum normalization value is larger the the smallest primary score. Make sure the minimum value is either equal or smaller then the smallest primary score.")
                        console.error(`The minValue is larger then the smallest primary score: \n minValue = ${minValueCustom}`)
                        return false
                    }
                }
            }
        } else if (NormSettingsPairPerformance["maxValue"] == "custom"){
            for (let player1 in data["pairPerformance"]){
                for (let pairScore of Object.values(data["pairPerformance"][player1])){
                    if (pairScore > NormSettingsPairPerformance["maxValueCustom"]){
                        show_message("The maximum normalization value is smaller the the largest primary score. Make sure the maximum value is either greater or equal to then the largest primary score.")
                        console.error(`The maxValue is smaller then the largest primary score: \n minValue = ${maxValueCustom}`)
                        return false
                    }
                }
            }
        }
    }
    console.log("Saving normalization settings was successfull.")
    const NormSettings = {
        "NormSettingsPrimaryScore" : NormSettingsPrimaryScore,
        "NormSettingsPairPerformance" : NormSettingsPairPerformance
    }
    return NormSettings
}

function initializeAnalyzeTabButton(){
    document.getElementById("edit_data_tab_analyze_tab").addEventListener("click", () => {
        document.getElementById("edit_data_tab").classList.remove("active_tab")
        document.querySelector('[data-tab-target="#edit_data_tab"]').classList.remove("active")
        document.getElementById("analysis_tab").classList.add("active_tab")
        document.querySelector('[data-tab-target="#analysis_tab"]').classList.add("active")
    })
}

function initializeAnalyzeButton(){
    document.getElementById("analyze_project").addEventListener("click", async() => {
        const project = await get_project_json(selected_save_data_edit)
        anaylze_result = await analyze_project(project)
        build_results_preview(anaylze_result)
        document.getElementById("sort_hidden_selector").checked = true
        document.getElementById("analysis_tab").classList.remove("active_tab")
        document.querySelector('[data-tab-target="#analysis_tab"]').classList.remove("active")
        document.getElementById("results_tab").classList.add("active_tab")
        document.querySelector('[data-tab-target="#results_tab"]').classList.add("active")
    })
}

function initializeSaveButton(){
    const save_button = document.getElementById("save_button")
    save_button.addEventListener("click", async () => {
        const project = get_project_json(selected_save_data)
        save_project(project)})
}

async function save_project(project){
    console.log(project)
    try{
        if (verify_project(project)){
            const response = await fetch(`${api_address}/user-save-project`, {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(project)
            })
            
            if (!response.ok){
                throw new Error(`Request failed with status ${response.status}`)
            }
            show_message("Saving project was successful", "success")
            const data = await response.json();
            console.log("Saving successfull: ", data)
        }
    } 
    catch (error){
        console.error("Error: ", error)
    }
}

function apply_settings_analysis(selected_save_data){
    const settings = selected_save_data["settings"]
    if (settings["interchangeableTeams"]){
        document.getElementById("analyze_settings_interchangeable_toggle").setAttribute("checked", true)
    }
    document.getElementById("analyze_settings_max_sit_out_players").value = settings["maxSittingOut"]
    document.getElementById("analyze_settings_max_difference_teams").value = settings["maxDifferenceTeams"]
    document.getElementById("analyze_settings_max_difference_pitches").value = settings["maxDifferencePitches"]
    if ("normalizationSettings" in selected_save_data["settings"]){
        apply_norm_settings_analysis(selected_save_data["settings"]["normalizationSettings"])
    }   
}

function apply_norm_settings_analysis(norm_settings){
    // Primary Score Norm Settings
    const primary_settings = norm_settings["NormSettingsPrimaryScore"]
    const primary_input_ids = ["normalization_primary_score_type", "normalization_primary_score_min", "normalization_primary_score_min_custom", "normalization_primary_score_max", "normalization_primary_score_max", "normalization_primary_score_min_output", "normalization_primary_score_min_output_custom", "normalization_primary_score_max_output", "normalization_primary_score_max_output_custom"]
    if (!primary_settings["status"]){
        document.getElementById("normalization_primary_toggle").checked = false
        document.getElementById("normalization_primary_toggle_status").innerText = "OFF"
        document.getElementById("normalization_primary_score_type").value = primary_settings["type"]
        batchEditClass(primary_input_ids, "disabled_input", true)
    } else{
        document.getElementById("normalization_primary_toggle").checked = true
        document.getElementById("normalization_primary_toggle_status").innerText = "ON"
        document.getElementById("normalization_primary_score_type").value = primary_settings["type"]
        batchEditClass(primary_input_ids, "disabled_input", false)
    }
    document.getElementById("normalization_primary_score_type").value = primary_settings["type"]
    document.getElementById("normalization_primary_score_min").value = primary_settings["minValue"]
    document.getElementById("normalization_primary_score_min_custom").value = primary_settings["minValueCustom"]
    document.getElementById("normalization_primary_score_max").value = primary_settings["maxValue"]
    document.getElementById("normalization_primary_score_max_custom").value = primary_settings["maxValueCustom"]
    document.getElementById("normalization_primary_score_max_custom").value = primary_settings["minValueOutput"]
    document.getElementById("normalization_primary_score_max_custom").value = primary_settings["minValueOutputCustom"]
    document.getElementById("normalization_primary_score_max_custom").value = primary_settings["maxValueOutput"]
    document.getElementById("normalization_primary_score_max_custom").value = primary_settings["maxValueOutputCustom"]
    // Pair Performance Norm Settings
    const pair_settings = norm_settings["NormSettingsPairPerformance"]

    document.getElementById("normalization_pair_toggle").checked = pair_settings["status"]
    document.getElementById("normalization_pair_score_type").value = pair_settings["type"]
    document.getElementById("normalization_pair_score_min").value = pair_settings["minValue"]
    document.getElementById("normalization_pair_score_min_custom").value = pair_settings["minValueCustom"]
    document.getElementById("normalization_pair_score_max").value = pair_settings["maxValue"]
    document.getElementById("normalization_pair_score_max_custom").value = pair_settings["maxValueCustom"]
    document.getElementById("normalization_pair_score_max_custom").value = pair_settings["minValueOutput"]
    document.getElementById("normalization_pair_score_max_custom").value = pair_settings["minValueOutputCustom"]
    document.getElementById("normalization_pair_score_max_custom").value = pair_settings["maxValueOutput"]
    document.getElementById("normalization_pair_score_max_custom").value = pair_settings["maxValueOutputCustom"]
    update_norm_settings_visual()
}

function update_norm_settings_visual(){

    //Primary Norm Settings
    const primary_input_ids = [
        "normalization_primary_score_type", 
        "normalization_primary_score_min","normalization_primary_score_min_custom",
        "normalization_primary_score_max", "normalization_primary_score_max",
        "normalization_primary_score_min_output", "normalization_primary_score_min_output_custom",
        "normalization_primary_score_max_output", "normalization_primary_score_max_output_custom"
    ]
    if (document.getElementById("normalization_primary_toggle").checked){
        document.getElementById("normalization_primary_toggle_status").innerText == "ON"
        batchEditClass(primary_input_ids, "disabled_input", true)
    } else {
        document.getElementById("normalization_primary_toggle_status").innerText == "OFF"
        batchEditClass(primary_input_ids, "disabled_input", false)
    }

    if (document.getElementById("normalization_primary_score_min").value == "custom"){
        document.getElementById("normalization_primary_score_min_custom").classList.remove("hide")
    } else {
        document.getElementById("normalization_primary_score_min_custom").classList.add("hide")
    }

    if (document.getElementById("normalization_primary_score_max").value == "custom"){
        document.getElementById("normalization_primary_score_max_custom").classList.remove("hide")
    } else {
        document.getElementById("normalization_primary_score_max_custom").classList.add("hide")
    }

    if (document.getElementById("normalization_primary_score_min_output").value == "custom"){
        document.getElementById("normalization_primary_score_min_output_custom").classList.remove("hide")
    } else {
        document.getElementById("normalization_primary_score_min_output_custom").classList.add("hide")
    }

    if (document.getElementById("normalization_primary_score_max_output").value == "custom"){
        document.getElementById("normalization_primary_score_max_output_custom").classList.remove("hide")
    } else {
        document.getElementById("normalization_primary_score_max_output_custom").classList.add("hide")
    }

    // Weight

    if (document.getElementById("normalization_settings_weight").value == "custom"){
        document.getElementById("normalization_settings_weight_custom").classList.remove("hide")
    } else{
        document.getElementById("normalization_settings_weight_custom").classList.add("hide")
    }
    // Pair Performance
    const pair_input_ids = [
        "normalization_pair_score_type", 
        "normalization_pair_score_min","normalization_pair_score_min_custom",
        "normalization_pair_score_max", "normalization_pair_score_max",
        "normalization_pair_score_min_output", "normalization_pair_score_min_output_custom",
        "normalization_pair_score_max_output", "normalization_pair_score_max_output_custom"
    ]
    if (document.getElementById("normalization_pair_toggle").checked){
        document.getElementById("normalization_pair_toggle_status").innerText == "ON"
        batchEditClass(pair_input_ids, "disabled_input", true)
    } else {
        document.getElementById("normalization_pair_toggle_status").innerText == "OFF"
        batchEditClass(pair_input_ids, "disabled_input", false)
    }

    if (document.getElementById("normalization_pair_score_min").value == "custom"){
        document.getElementById("normalization_pair_score_min_custom").classList.remove("hide")
    } else {
        document.getElementById("normalization_pair_score_min_custom").classList.add("hide")
    }

    if (document.getElementById("normalization_pair_score_max").value == "custom"){
        document.getElementById("normalization_pair_score_max_custom").classList.remove("hide")
    } else {
        document.getElementById("normalization_pair_score_max_custom").classList.add("hide")
    }

    if (document.getElementById("normalization_pair_score_min_output").value == "custom"){
        document.getElementById("normalization_pair_score_min_output_custom").classList.remove("hide")
    } else {
        document.getElementById("normalization_pair_score_min_output_custom").classList.add("hide")
    }

    if (document.getElementById("normalization_pair_score_max_output").value == "custom"){
        document.getElementById("normalization_pair_score_max_output_custom").classList.remove("hide")
    } else {
        document.getElementById("normalization_pair_score_max_output_custom").classList.add("hide")
    } //HERE
}

var anaylze_result = {};

async function analyze_project(project){
    try{
        if (project["pitches"].length > 0){
            if (verify_project(project)){
                console.log(project)
                const response = await fetch(`${api_address}/analyze`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(project)
                })
                if (!response.ok){
                    show_message("An unexpected error occurred. Please try again later.", "warning")
                    throw new Error(`Request failed with status ${response.status}`)
                }
                show_message("Analyzing was successful", "success")
                const data = await response.json()
                console.log("Analyzing was successful")
                return data
            }
        } else{
            show_message("There are no teams in the data. Create at least one pitch.", "warning")
        }
    }
    catch (error){
        console.error("Error: ", error)
    }
}

function build_pitches(project_data){
    const teams_names_list = Object.keys(project_data["teams"])
    const teams_data = project_data.teams
    const allocated_players = []
    teams_names_list.forEach(team_name => {
        allocated_players.push(...teams_data[team_name].players)
    })
    const players = Object.keys(project_data.players)
    const unallocated_players = players.filter(player => !allocated_players.includes(player))
    const pitches_container = document.getElementById("analyze_results_pitches")
    pitches_container.innerHTML = `
    <div id="analyze_configure_add_pitch_container">
        <div id="analyze_configure_add_pitch_button">
            <img src="frontend/UI/img/icon/add.svg" alt="Add Pitch">
            <p>Add Pitch</p>
        </div>
    </div>`
    initializeAddPitchButton()
    if (project_data["pitches"].length > 0){
        project_data["pitches"].forEach((pitch_name, pitch_index) => {
            const team1 = teams_names_list[pitch_index*2]
            const team2 = teams_names_list[pitch_index*2+1]

            const num_players_team1 = project_data.teams[team1].num_players
            const num_players_team2 = project_data.teams[team2].num_players
            const players_team1 = project_data.teams[team1].players
            const players_team2 = project_data.teams[team2].players

            const players = project_data.players

            const pitch = build_pitch(pitch_name, team1, num_players_team1, players_team1, team2, num_players_team2, players_team2, unallocated_players, players)
            pitches_container.appendChild(pitch)
        })
    }
}

function build_pitch(pitch_name, team_1, num_players_team1, players_team1, team_2, num_players_team2, players_team2, unallocated_players, players){
    const analyze_pitch_container = document.createElement("div")
    analyze_pitch_container.classList.add("analyze_results_pitch")

    const analyze_pitch_title = document.createElement("div")
    analyze_pitch_title.classList.add("analyze_pitch_title")

    const analyze_pitch_title_input = document.createElement("input")
    analyze_pitch_title_input.setAttribute("type", "text");
    analyze_pitch_title_input.classList.add("analyze_pitch_title_input")
    analyze_pitch_title_input.value = pitch_name

    const analyze_pitch_delete = document.createElement("button")
    analyze_pitch_delete.classList.add("red_button")
    analyze_pitch_delete.classList.add("analyze_pitch_delete")
    analyze_pitch_delete.innerText = "Delete"
    analyze_pitch_delete.addEventListener("click", () => {
        analyze_pitch_container.remove()
        const freed_players = Array.from(analyze_pitch_container.querySelectorAll(".analyze_pitch_team_player_name")).map(p => p.innerText)
        document.querySelectorAll(".analyze_results_pitch_team_add_player_selection").forEach(selector => {
            freed_players.forEach(freed_player => {
                const player_option = document.createElement("option")
                player_option.value = freed_player
                player_option.innerText = freed_player
                player_option.classList.add(`add_player_to_team_${player_name.replace(/ /g, "_")}`)
                selector.appendChild(player_option)
            })
        })
    })

    const analyze_pitch_teams_container = document.createElement("div")
    analyze_pitch_teams_container.classList.add("analyze_pitch_teams")

    const analyze_pitch_teams_seperater = document.createElement("div")
    analyze_pitch_teams_seperater.classList.add("spacer_vertical_20px")

    // Build Pitch
    analyze_pitch_title.appendChild(analyze_pitch_title_input)
    analyze_pitch_title.appendChild(analyze_pitch_delete)
    
    analyze_pitch_teams_container.appendChild(build_team(team_1, unallocated_players, num_players_team1, players_team1, players))
    analyze_pitch_teams_container.appendChild(analyze_pitch_teams_seperater)
    analyze_pitch_teams_container.appendChild(build_team(team_2, unallocated_players, num_players_team2, players_team2, players))



    analyze_pitch_container.appendChild(analyze_pitch_title)
    analyze_pitch_container.appendChild(analyze_pitch_teams_container)
    return analyze_pitch_container
}

function build_team(team_name, unallocated_players, num_players_team, players_team, players){
    const analyze_pitch_team = document.createElement("div")
    analyze_pitch_team.classList.add("analyze_pitch_team")

    const analyze_pitch_team_title = document.createElement("div")
    analyze_pitch_team_title.classList.add("analyze_pitch_team_title")

    const analyze_pitch_team_title_input = document.createElement("input")
    analyze_pitch_team_title_input.setAttribute("type", "text")
    analyze_pitch_team_title_input.value = team_name
    analyze_pitch_team_title_input.classList.add("analyze_pitch_team_title_input")

    const analyze_pitch_team_num_players = document.createElement("select")
    analyze_pitch_team_num_players.classList.add("analyze_pitch_team_num_players")

    analyze_pitch_team_num_players.innerHTML = `<option value="a">automatic</option>`

    let counter_options_num_players = 0
    while (counter_options_num_players < unallocated_players.length){
        counter_options_num_players ++
        const option = document.createElement("option")
        option.setAttribute("value", counter_options_num_players)
        option.innerText = counter_options_num_players
        analyze_pitch_team_num_players.appendChild(option)
    }
    if (analyze_pitch_team_num_players.value == "a" || analyze_pitch_team_num_players.value == null){
        analyze_pitch_team_num_players.value = "a"
    } else {
        analyze_pitch_team_num_players.value = num_players_team
    }


    const analyze_pitch_team_players = document.createElement("ul")
    analyze_pitch_team_players.classList.add("analyze_pitch_team_players")


    players_team.forEach((player_name) => {
        const analyze_pitch_team_selection_option = document.createElement("li")
        analyze_pitch_team_selection_option.classList.add("analyze_pitch_team_player")
    
        const analyze_pitch_team_selection_option_player_name = document.createElement("p")
        analyze_pitch_team_selection_option_player_name.classList.add("analyze_pitch_team_player_name")
        analyze_pitch_team_selection_option_player_name.innerText = player_name
        const analyze_pitch_team_selection_option_player_score = document.createElement("p")
        analyze_pitch_team_selection_option_player_score.innerText = players[player_name]["primaryScore"]
        analyze_pitch_team_selection_option_player_score.classList.add("analyze_pitch_team_player_score")
        
        const analyze_pitch_team_selection_option_player_delete_container = document.createElement("div")
        analyze_pitch_team_selection_option_player_delete_container.classList.add("analyze_pitch_team_player_delete")

        const analyze_pitch_team_selection_option_player_delete_icon = document.createElement("img")
        analyze_pitch_team_selection_option_player_delete_icon.setAttribute("src", "frontend/UI/img/icon/close2.svg")
        analyze_pitch_team_selection_option_player_delete_icon.setAttribute("style", "height: 15px;")
        analyze_pitch_team_selection_option_player_delete_icon.addEventListener("click", () => {
            analyze_pitch_team_selection_option.remove()
            document.querySelectorAll(".analyze_results_pitch_team_add_player_selection").forEach(selector => {
                const player_select = document.createElement("option")
                player_select.value = player_name
                player_select.classList.add(`add_player_to_team_${player_name.replace(/ /g, "_")}`)
                player_select.innerText = player_name
                selector.appendChild(player_select)
            })
        })

        analyze_pitch_team_selection_option_player_delete_container.appendChild(analyze_pitch_team_selection_option_player_delete_icon)
        
        analyze_pitch_team_selection_option.appendChild(analyze_pitch_team_selection_option_player_name)
        analyze_pitch_team_selection_option.appendChild(analyze_pitch_team_selection_option_player_score)
        analyze_pitch_team_selection_option.appendChild(analyze_pitch_team_selection_option_player_delete_container)
        analyze_pitch_team_players.appendChild(analyze_pitch_team_selection_option)
    })

    const analyze_pitch_team_add_player = document.createElement("div")
    analyze_pitch_team_add_player.classList.add("analyze_results_pitch_team_add_player")

    const analyze_pitch_team_add_player_symbol = document.createElement("img")
    analyze_pitch_team_add_player_symbol.setAttribute("src", "frontend/UI/img/icon/add.svg")
    analyze_pitch_team_add_player_symbol.setAttribute("alt", "Add Player to Team")
    analyze_pitch_team_add_player_symbol.classList.add("analyze_results_pitch_team_add_player_symbol")

    const analyze_pitch_team_add_player_selection = document.createElement("select")
    analyze_pitch_team_add_player_selection.classList.add("analyze_results_pitch_team_add_player_selection")
    unallocated_players.forEach(player_name => {
        const player_option = document.createElement("option")
        player_option.value = player_name
        player_option.innerText = player_name
        player_option.classList.add(`add_player_to_team_${player_name.replace(/ /g, "_")}`)
        analyze_pitch_team_add_player_selection.appendChild(player_option)
    })

    analyze_pitch_team_add_player_symbol.addEventListener("click", () => {
        if (analyze_pitch_team_add_player_selection.value != undefined || analyze_pitch_team_add_player_selection.value != ""){
            add_player_to_team(analyze_pitch_team_add_player_selection.value, selected_save_data_edit.players[analyze_pitch_team_add_player_selection.value], analyze_pitch_team_players, analyze_pitch_team_title_input.value)

        }
    })

    // Build Team
    analyze_pitch_team_add_player.appendChild(analyze_pitch_team_add_player_symbol)
    analyze_pitch_team_add_player.appendChild(analyze_pitch_team_add_player_selection)

    analyze_pitch_team_title.appendChild(analyze_pitch_team_title_input)
    analyze_pitch_team_title.appendChild(analyze_pitch_team_num_players)

    analyze_pitch_team.appendChild(analyze_pitch_team_title)
    analyze_pitch_team.appendChild(analyze_pitch_team_players)
    analyze_pitch_team.appendChild(analyze_pitch_team_add_player)
    return analyze_pitch_team
}

function initializeAddPitchButton(){
    document.getElementById("analyze_configure_add_pitch_button").addEventListener("click", () => {
        const pitches_count = document.querySelectorAll(".analyze_results_pitch").length
        const allocated_players = Array.from(document.querySelectorAll(".analyze_pitch_team_player_name")).map(p => p.innerText)
        const players = Object.keys(selected_save_data_edit.players)
        const unallocated_players = players.filter(player => !allocated_players.includes(player))
        document.getElementById("analyze_results_pitches").appendChild(build_pitch(`Pitch ${pitches_count+1}`, `Team ${pitches_count*2+1}`, "a", [], `Team ${pitches_count*2+2}`, "a", [], unallocated_players, {}))
    })
}

function build_results_preview(response_data){
    document.getElementById("results_possibilities_list_selection").innerHTML = ""
    let possibilities_count = 0;
    const results_possibilities_list_selection = document.getElementById("results_possibilities_list_selection")
    response_data.forEach(possibility => {
        possibilities_count += 1
        
        const result_possibilities_list_option = document.createElement("ul")
        result_possibilities_list_option.classList.add("result_possibilities_list_option")

        const results_possibilities_list_ranking = document.createElement("p")
        results_possibilities_list_ranking.classList.add("results_possibilities_list_ranking")
        results_possibilities_list_ranking.innerText = possibilities_count

        const result_possibilities_list_option_details_container = document.createElement("div")

        const result_possibilities_list_option_details_skill_diff = document.createElement("p")
        result_possibilities_list_option_details_skill_diff.classList.add("result_possibilities_list_option_details")
        result_possibilities_list_option_details_skill_diff.innerText = `skill difference: ${Math.round(possibility["difference"]*100)/100}`

        const result_possibilities_list_option_details_sitting_out = document.createElement("p")
        result_possibilities_list_option_details_sitting_out.classList.add("result_possibilities_list_option_details")
        result_possibilities_list_option_details_sitting_out.innerText = `sitting out players: ${possibility["sitting_out"]}`

        const result_possibilities_list_option_team_sizes = document.createElement("div")
        result_possibilities_list_option_team_sizes.classList.add("result_possibilities_list_option_team_sizes")
        for (let i; i < possibility["teams_size"].length; i += 2){
            const result_possibilities_list_option_team_size = document.createElement("p")
            result_possibilities_list_option_team_size.classList.add("result_possibilities_list_option_team_size")
            result_possibilities_list_option_team_size.innerText = `${possibility["teams_size"][i]} - ${possibility["teams_size"][i+1]}`
            result_possibilities_list_option_team_sizes.appendChild(result_possibilities_list_option_team_size)
        }

        result_possibilities_list_option.appendChild(results_possibilities_list_ranking)

        result_possibilities_list_option_details_container.appendChild(result_possibilities_list_option_details_skill_diff)
        result_possibilities_list_option_details_container.appendChild(result_possibilities_list_option_details_sitting_out)

        result_possibilities_list_option.append(result_possibilities_list_option_details_container)
        result_possibilities_list_option.append(result_possibilities_list_option_team_sizes)

        result_possibilities_list_option.addEventListener("click", () => {
            document.querySelectorAll(".result_possibilities_list_option").forEach(option => {
                option.classList.remove("result_possibilities_list_option_selected")
            })
            result_possibilities_list_option.classList.add("result_possibilities_list_option_selected")
            build_result(possibility)
        })

        results_possibilities_list_selection.append(result_possibilities_list_option)
    })
}

function build_result(possible_game){
    document.getElementById("results_possibility_container").innerHTML = ""
    Object.keys(possible_game["pitches"]).forEach((pitch_name) => {
        const pitch_data = possible_game["pitches"][pitch_name]

        const results_pitch_container = document.createElement("div")
        results_pitch_container.classList.add("results_pitch_container")
    
        const results_pitch_title_container = document.createElement("div")
        results_pitch_title_container.classList.add("results_pitch_title_container")
    
        const results_pitch_title = document.createElement("input")
        results_pitch_title.classList.add("results_pitch_title")
        results_pitch_title.setAttribute("type", "text")
        results_pitch_title.disabled = true
        results_pitch_title.value = pitch_name

        const results_pitch_difference = document.createElement("input")
        results_pitch_difference.classList.add("results_pitch_difference")
        results_pitch_difference.setAttribute("type", "text")
        results_pitch_difference.disabled = true

        const team_scores = []

        const results_teams_container = document.createElement("div")
        results_teams_container.classList.add("results_teams_container")

        Object.keys(possible_game["pitches"][pitch_name]).forEach((team_name) => {
            const results_team_container = document.createElement("div")
            results_team_container.classList.add("results_team_container")
            
            const results_team_title_container = document.createElement("div")
            results_team_title_container.classList.add("results_team_title_container")

            const results_team_title = document.createElement("input")
            results_team_title.classList.add("results_team_title")
            results_team_title.setAttribute("type", "text")
            results_team_title.disabled = true
            results_team_title.value = team_name

            const results_team_teamsize = document.createElement("input")
            results_team_teamsize.classList.add("results_team_teamsize")
            results_team_teamsize.setAttribute("type", "text")
            results_team_teamsize.disabled = true
            results_team_teamsize.value = `Players: ${pitch_data[team_name].players.length}`

            const results_team_players = document.createElement("ul")
            results_team_players.classList.add("results_team_players")
            
            pitch_data[team_name].players.forEach(player_data => {
                const [player_name, player_score] = Object.entries(player_data)[0]

                const results_team_player = document.createElement("li")
                results_team_player.classList.add("results_team_player")

                const results_team_player_name = document.createElement("p")
                results_team_player_name.innerText = player_name
                
                const results_team_player_score = document.createElement("p")
                results_team_player_score.innerText = Math.round(player_score*100)/100

                results_team_player.appendChild(results_team_player_name)
                results_team_player.appendChild(results_team_player_score)
                results_team_players.append(results_team_player)
            })
            const results_team_teamscore = document.createElement("input")
            results_team_teamscore.classList.add("results_team_teamscore")
            results_team_teamscore.setAttribute("type", "text")
            results_team_teamscore.disabled = true
            results_team_teamscore.value = Math.round(pitch_data[team_name].team_score *100)/100
            team_scores.push(pitch_data[team_name].team_score)

            results_team_title_container.appendChild(results_team_title)
            results_team_title_container.appendChild(results_team_teamsize)

            results_team_container.appendChild(results_team_title_container)
            results_team_container.appendChild(results_team_players)
            results_team_container.appendChild(results_team_teamscore)
            results_teams_container.appendChild(results_team_container)
        })
        results_pitch_difference.value = Math.round(Math.abs(team_scores[0] - team_scores[1])*100)/100

        results_pitch_title_container.appendChild(results_pitch_title)
        results_pitch_title_container.appendChild(results_pitch_difference)

        results_pitch_container.appendChild(results_pitch_title_container)
        results_pitch_container.appendChild(results_teams_container)
        document.getElementById("results_possibility_container").appendChild(results_pitch_container)
    })
}
function update_player_name_upon_change(name_input_field){
    const previous_name_classname = Array.from(name_input_field.classList).find(className => className.startsWith("table_input_name_"))
    const previous_name = previous_name_classname.replace("table_input_name_", "")
    const new_name = name_input_field.value
    name_input_field.classList.remove(`table_input_name_${previous_name}`)
    name_input_field.classList.add(`table_input_name_${new_name}`)

    update_player_name_in_ui_upon_change(previous_name, new_name)
    const previous_name_unformatted = previous_name.replace(/_/g, " ")
    const updated_team_data = update_player_name_in_data_upon_change(previous_name_unformatted, new_name, selected_save_data_edit)
    return updated_team_data
}

function update_player_name_in_ui_upon_change(previous_name, new_name){
    console.log(`previous_name = ${previous_name}, new_name = ${new_name}`)
    document.querySelectorAll(`.add_player_to_team_${previous_name.replace(/ /g,"_")}`).forEach(element => {
        element.innerText = new_name
        element.value = new_name
        element.classList.remove(`.add_player_to_team_${previous_name.replace(/ /g,"_")}`)
        element.classList.add(`add_player_to_team_${new_name.replace(/ /g,"_")}`)
    })
    document.querySelectorAll(`.analyze_pitch_team_player_name_${previous_name.replace(/ /g, "_")}`).forEach(element => {
        element.innerText = new_name
        element.classList.remove(`analyze_pitch_team_player_name_${previous_name.replace(/ /g,"_")}`)
        element.classList.add(`analyze_pitch_team_player_name_${new_name.replace(/ /g,"_")}`)
    })
    document.querySelectorAll(`.ptp_head_${previous_name.replace(/ /g, "_")}`).forEach(element => {
        element.innerText = new_name
        element.classList.remove(`ptp_head_${previous_name.replace(/ /g,"_")}`)
        element.classList.add(`ptp_head_${new_name.replace(/ /g,"_")}`)
    })
    document.querySelectorAll(`.ptp_body_${previous_name.replace(/ /g, "_")}`).forEach(element => {
        element.innerText = new_name
        element.classList.remove(`ptp_body_${previous_name.replace(/ /g,"_")}`)
        element.classList.add(`ptp_body_${new_name.replace(/ /g,"_")}`)
    })

}

function update_player_name_in_data_upon_change(previous_name, new_name, data){
    if (data["players"].hasOwnProperty(previous_name)){
        data["players"][new_name] = data["players"][previous_name]
        delete data["players"][previous_name]
    } else {
        show_message("The player does not appear to exist in the data. The change could not be applied.", "warning")
        console.error(`The player does not appear to exist in the data. The change could not be applied. previous_name = ${previous_name}, new_name = ${new_name}`)
        console.log(data)
        return
    }
    if (data["pairPerformance"].hasOwnProperty(previous_name)){
        data["pairPerformance"][new_name] = data["pairPerformance"][previous_name]
        delete data["pairPerformance"][previous_name]
        data["pairPerformance"][new_name][new_name] = data["pairPerformance"][new_name][previous_name]
        delete data["pairPerformance"][new_name][previous_name]
    } else {
        show_message("The player does not appear to exist in the pair performance data. The change could not be applied.", "warning")
        console.error(`The player does not appear to exist in the pair performance data. The change could not be applied. previous_name = ${previous_name}, new_name = ${new_name}`)
        console.log(data)
        return
    }

    Object.keys(data["pairPerformance"]).forEach(player_name1 => {
        if (data["pairPerformance"][player_name1][previous_name] !== undefined){
            data["pairPerformance"][player_name1][new_name] = data["pairPerformance"][player_name1][previous_name]
            delete data["pairPerformance"][player_name1][previous_name]
        }
    })
    return data
}

function initializeNormSettingsButton(){
    document.getElementById("open_norm_settings_window").addEventListener("click", () => {
        document.getElementById("normalization_settings_dimming").classList.remove("hide")
    })
    document.getElementById("normalization_settings_close").addEventListener("click", () => {
        document.getElementById("normalization_settings_dimming").classList.add("hide")
        document.getElementById("normalization_primary_score_min").value = "symmetric"
        document.getElementById("normalization_primary_score_max").value = "symmetric"
        document.getElementById("normalization_pair_score_min").value = "symmetric"
        document.getElementById("normalization_pair_score_max").value = "symmetric"
    })
    document.getElementById("normalization_settings_save").addEventListener("click", () => {
        const norm_settings = gather_project_data_norm_settings(selected_save_data_edit)
        if (norm_settings !== false){
            console.log("Verifying normalization settings starting...")
            if (verify_norm_settings(norm_settings)){
                document.getElementById("normalization_settings_dimming").classList.add("hide")
            } else {
                console.error("The normalization settings are invalid")
            }
        }

    })
}

function initializeCustomInputShow(){
    function event_listeners_hide_in_case_of_value(input_element_id, hide_element_id, condition_input){
        const input_element = document.getElementById(input_element_id)
        const hide_element = document.getElementById(hide_element_id)
        input_element.addEventListener("input", () => {
            if (input_element.value == condition_input){
                hide_element.classList.remove("hide")
            } else {
                hide_element.classList.add("hide")
            }
        })
    }
    // Primary
    event_listeners_hide_in_case_of_value("normalization_primary_score_min", "normalization_primary_score_min_custom", "custom")
    event_listeners_hide_in_case_of_value("normalization_primary_score_max", "normalization_primary_score_max_custom", "custom")
    event_listeners_hide_in_case_of_value("normalization_primary_score_min_output", "normalization_primary_score_min_output_custom", "custom")
    event_listeners_hide_in_case_of_value("normalization_primary_score_max_output", "normalization_primary_score_max_output_custom", "custom")

    // Pair
    event_listeners_hide_in_case_of_value("normalization_pair_score_min", "normalization_pair_score_min_custom", "custom")
    event_listeners_hide_in_case_of_value("normalization_pair_score_max", "normalization_pair_score_max_custom", "custom")
    event_listeners_hide_in_case_of_value("normalization_pair_score_min_output", "normalization_pair_score_min_output_custom", "custom")
    event_listeners_hide_in_case_of_value("normalization_pair_score_max_output", "normalization_pair_score_max_output_custom", "custom")
}

function initializeNormSettingsCustomWeight(){
    const weight_select = document.getElementById("normalization_settings_weight")
    const weight_custom_container = document.getElementById("normalization_settings_weight_custom_container")
    weight_select.addEventListener("input", () => {
        if (weight_select.value == "custom"){
            weight_custom_container.classList.remove("hide")
        } else{
            weight_custom_container.classList.add("hide")
        }
    })
    short_uvoiuc("normalization_settings_weight_custom", "normalization_settings_weight_custom_display")
}
// A shortcut of "update_value_of_input_upon_change" for certain usecases
function short_uvoiuc(id_element_1, id_element_2){
    const e1 = document.getElementById(id_element_1)
    const e2 = document.getElementById(id_element_2)
    update_value_of_input_upon_change(e1, e2)
    update_value_of_input_upon_change(e2, e1)
}

function update_value_of_input_upon_change(element_1, element_2){
    element_1.addEventListener("input", () => {
        element_2.value = element_1.value
    })
}

function initializeIterationInput(){
    short_uvoiuc("analyze_settings_iteration_range", "analyze_settings_iteration_input")
}

function initializeToggleNormPair() {
    const toggleInput = (ids, toggleCheckbox, statusTextId) => {
        const toggleState = toggleCheckbox.checked;
        const statusElement = document.getElementById(statusTextId);
        if (statusElement) {
            statusElement.innerText = toggleState ? "ON" : "OFF";
        }

        ids.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                element.disabled = !toggleState;
                element.classList.toggle("disabled_input", !toggleState);
            }
        });
    };
    const normalization_pair_toggle = document.getElementById("normalization_pair_toggle");

    normalization_pair_toggle.addEventListener("change", () => {
        const ids = [
            "normalization_pair_score_min",
            "normalization_pair_score_min_custom",
            "normalization_pair_score_max",
            "normalization_pair_score_max_custom",
            "normalization_pair_score_type",
            "normalization_pair_score_min_output",
            "normalization_pair_score_min_output_custom",
            "normalization_pair_score_max_output",
            "normalization_pair_score_max_output_custom"
        ];
        toggleInput(ids, normalization_pair_toggle, "normalization_pair_toggle_status");
    });
    const normalization_primary_toggle = document.getElementById("normalization_primary_toggle")

    normalization_primary_toggle.addEventListener("change", () => {
        const ids = [
            "normalization_primary_score_min",
            "normalization_primary_score_min_custom",
            "normalization_primary_score_max",
            "normalization_primary_score_max_custom",
            "normalization_primary_score_type",
            "normalization_primary_score_min_output",
            "normalization_primary_score_min_output_custom",
            "normalization_primary_score_max_output",
            "normalization_primary_score_max_output_custom"
        ]
        toggleInput(ids, normalization_primary_toggle, "normalization_primary_toggle_status");
    })
}

function initializeInterchangeableSetting(){
    const interchangeable_toggle = document.getElementById("analyze_settings_interchangeable_toggle")
    interchangeable_toggle.addEventListener("change", () => {
        if (interchangeable_toggle.checked){
            document.getElementById("analyze_settings_interchangeable_toggle_status").innerText = "ON"
        } else {
            document.getElementById("analyze_settings_interchangeable_toggle_status").innerText = "OFF"
        }
    })
}

function apply_user_preferences(user_data){
    console.log(user_data)
    const user_permissions = user_data["permissions"]
    document.getElementById("analyze_settings_iteration_range").setAttribute("max", Number(user_permissions["max_iterations_count"]))
    if (!user_permissions["custom_iteration_count"]){
        document.getElementById("analyze_settings_iteration_input_container").classList.add("hide")
    } else {
        document.getElementById("analyze_settings_iteration_input_container").classList.remove("hide")
    }
}

function initializeResultsSortingOptions(){
    const sort_difference_selector = document.getElementById("results_sort_option_sd")
    sort_difference_selector.addEventListener("input", () => {
        if (sort_difference_selector.checked){
            if (anaylze_result){
                anaylze_result.sort((a,b) => a.difference - b.difference);
                build_results_preview(anaylze_result)
            }
        }
    })
    const sort_sitting_out_players_selector = document.getElementById("results_sort_option_sop")
    sort_sitting_out_players_selector.addEventListener("input", () => {
        if (sort_sitting_out_players_selector.checked){
            if (anaylze_result){
                anaylze_result.sort((a,b) => a.sitting_out - b.sitting_out);
                build_results_preview(anaylze_result)
            }
        }
    })
    const sort_team_size_selector = document.getElementById("results_sort_option_ts")
    sort_team_size_selector.addEventListener("input", () => {
        if (sort_team_size_selector.checked){
            if (anaylze_result){
                anaylze_result.sort((a,b) => {
                    const string_a = JSON.stringify(a.teams_size)
                    const string_b = JSON.stringify(b.teams_size)

                    if (string_a < string_b) return -1
                    if (string_a > string_b) return 1
                    return 0
                });
                build_results_preview(anaylze_result)
            }
        }
    })
}

async function initializeContinuousPreviewLoading(){
    const data = await fetch_saves_preview(0);
    document.getElementById("list_saves").innerHTML = ""
    build_save_add()
    console.log(data)
    const user_data = data["user_data"];
    apply_user_preferences(user_data)
    build_save_items(data["project_previews"])
    let loaded_saves = data["project_previews"].length
    let saves_preview_package_count = 1;
    const list_saved_json = document.getElementById("list_saved_json")
    let distance_last_scroll_from_top = 0;
    list_saved_json.onscroll = async (e)=>{
        if (list_saved_json.scrollTop < distance_last_scroll_from_top){
            return
        }
        distance_last_scroll_from_top = list_saved_json.scrollTop
        if (list_saved_json.scrollTop + list_saved_json.offsetHeight >= list_saved_json.scrollHeight){
            const saves_preview = await fetch_saves_preview(saves_preview_package_count)
            build_save_items(saves_preview["project_previews"])
            saves_preview_package_count++
            if (loaded_saves > saves_preview["project_previews"].length){
                list_saved_json.onscroll = null
                console.log("No more saves to fetch.")
            }
        }
    }
}