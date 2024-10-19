// API URL
const api_address = "http://127.0.0.1:8000/";
const login_url = "http://127.0.0.1:8000/login"
/*Tab Management*/

const tabs = document.querySelectorAll('[data-tab-target]');
const tab_contents = document.querySelectorAll('[data-tab-content]');

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const target = document.querySelector(tab.dataset.tabTarget)
        tab_contents.forEach(tab_content => {
            tab_content.classList.remove("active_tab")
        })
        target.classList.add("active_tab")
    })
})

/*clear input file div*/
document.getElementById("clear_input_button").addEventListener("click", () => {
    document.getElementById("json_import_input").value = '';
});


/*Add Column Window*/

const add_column_window = document.getElementById("add_column_window");
const edit_player_table = document.getElementById("edit_player_table");
const add_row_window_dimming = document.getElementById("add_row_window_dimming");

document.getElementById("add_column").addEventListener("click", () => {
    add_column_window.classList.remove("hide");
    add_row_window_dimming.classList.remove("hide");
})

document.getElementById("add_column_window_close").addEventListener("click", () => {
    add_column_window.classList.add("hide");
    add_row_window_dimming.classList.add("hide");
})
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

function parseIntButForEmptyString(value){
    if (value == ""){
        return value
    } else {
        return parseInt(value)
    }
}

function remove_from_array_with_tag(array_of_items, array_of_unwanted_tags) {
    return Array.from(array_of_items).filter((item_from_array) => {
        return !array_of_unwanted_tags.includes(item_from_array.id);
    });
};
var counter_player_added = 0
/* Add Row */
document.addEventListener("DOMContentLoaded", () => {
    const add_row = document.getElementById("add_row");

    add_row.addEventListener("click", () => {
        counter_player_added += 1
        new_player_name = `Player${counter_player_added}`
        const NewRow = document.createElement("tr");
        NewRow.setAttribute("class", "player_data_row");

        /*  Attendance Cell  */
        const NewAttendanceCell = document.createElement("td");
        NewAttendanceCell.setAttribute("class", "edit_attendance");
        const NewAttendanceCell_div = document.createElement("div");
        NewAttendanceCell_div.setAttribute("class", "button_activation_attendance");
        NewAttendanceCell.appendChild(NewAttendanceCell_div)
        NewRow.appendChild(NewAttendanceCell)

        /*  Name Cell  */
        const NewNameCell = document.createElement("td");
        NewNameCell.setAttribute("class", "edit_name");
        const NewNameCell_textarea = document.createElement("textarea");
        NewNameCell_textarea.setAttribute("class", "table_input_text");
        NewNameCell_textarea.classList.add("table_input_name");
        NewNameCell_textarea.value = new_player_name
        NewNameCell.appendChild(NewNameCell_textarea)
        NewRow.appendChild(NewNameCell)

        /* Primery Score */
        const primaryScoreCell = document.createElement("td");
        const primaryScoreCellInput = document.createElement("input");
        primaryScoreCellInput.setAttribute("type", "number");
        primaryScoreCellInput.value = 0;
        primaryScoreCellInput.classList.add("table_input_number");
        primaryScoreCell.appendChild(primaryScoreCellInput);
        NewRow.appendChild(primaryScoreCell)

        /*  Number Cells  */ 
        const new_player = {
            [new_player_name]: {
                "attendanceState": "True",
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
        edit_player_table.appendChild(NewRow)
        selected_save_data_edit.players[new_player_name] = new_player[new_player_name];
        console.log(selected_save_data_edit)
        console.log(`NEW_PLAYER = ${new_player_name}`)

        const PlayerPairPerformance = {}
        PlayerPairPerformance[new_player_name] = {};

        Object.keys(selected_save_data_edit.pairPerformance).forEach(player => {
            PlayerPairPerformance[new_player_name][player] = 0
            selected_save_data_edit["pairPerformance"][player][new_player_name] = 0
        })
        selected_save_data_edit["pairPerformance"][new_player_name] = PlayerPairPerformance[new_player_name]

        NewAttendanceCell_div.addEventListener("click", () => {
            NewAttendanceCell_div.classList.toggle("red_deactivated");
        });
        build_player_to_player_table(selected_save_data_edit);
        apply_changes_to_data_name();
        apply_changes_to_skills_single_player(NewRow);
        update_list_players()
    });
});

document.addEventListener("DOMContentLoaded", () => {
    AttendanceIndicatorPlayerTableEventListeners()
    AttendanceIndicatorPreviewEventListeners()
})

/* Activation and deactivation */
// Edit Table - Needs to be changed: EventListeners needs to be adjusted each add_row click
function AttendanceIndicatorPlayerTableEventListeners(){
    const edit_player_table_activation_buttons = document.querySelectorAll(".button_activation_attendance");

    edit_player_table_activation_buttons.forEach((button) => {
        button.addEventListener("click", () => {
            button.classList.toggle("red_deactivated");
        });
    });
};

// import Player List

function AttendanceIndicatorPreviewEventListeners(){
    const import_player_list_status = Array.from(document.getElementsByClassName("properties_list_player_item_indicator"))
    import_player_list_status.forEach((button) => {
        button.addEventListener("click", () => {
            button.classList.toggle("red_deactivated")
        })
    })
}

// Preview selected save

var selected_save_data = "";
var selected_save_data_preview = ""

async function load_save_preview(selected_save) {
    const name_property_save = document.getElementById("properties_name_input")
    const number_players_property_save = document.getElementById("properties_player_count_input")
    const description_property_save = document.getElementById("properties_notes_input")
    try {
        const response_user_save = await fetch(`${api_address}/user-project-previews`, { //REWORK
            method: "GET",
            credentials: "include",
        })
        if(!response_user_save.ok){
            throw new Error("Selected Save API request returned not ok: " + response_user_save.statusText)
        }
        selected_save_data = await response_user_save.json();
        Object.keys(selected_save_data.players).forEach(player_name => {
            build_player_preview(selected_save_data, player_name)
        })

        name_property_save.value = selected_save_data["name"]
        number_players_property_save.setAttribute("placeholder", selected_save_data["number of players"])
        description_property_save.value = selected_save_data["description"]
        
        add_delete_option_for_players_in_preview()
        AttendanceIndicatorPreviewEventListeners()

        selected_save_data_preview = selected_save_data
        selected_save_data_edit = selected_save_data
    } catch (error) {
        console.error("Error in load_save_preview:", error)
    }
}
// selected saves
function selectionsaves(){
    const list_saves_items = Array.from(document.getElementsByClassName("list_saves_item"))

    list_saves_items.forEach((button) => {
        button.addEventListener("click", () => {
            list_saves_items.forEach((item) => {
                item.classList.remove("list_saves_item_selected")
            })
            button.classList.toggle("list_saves_item_selected")
            load_save_preview(button)
        })
    })
    // remove format when clicking on new project
    const add_new_save_button = document.getElementById("add_new_save")

    add_new_save_button.addEventListener("click", () => {
        selected_save_data = ""
        list_saves_items.forEach((button) => {
            button.classList.remove("list_saves_item_selected")
        })
    })
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

document.addEventListener("DOMContentLoaded", () => {
    const checkboxes = document.querySelectorAll(".checkboxes")

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("click", () => {
            checkbox.classList.toggle("checked")
        })
    })
})

let list_saves_json = [];

const list_saves = document.getElementById("list_saves")
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response_user_saves = await fetch(`${api_address}/user-project-previews`, {
            method: "POST",
            credentials: "include"
        });
        if (!response_user_saves.ok) {
            // window.location.href = login_url
            throw new Error("Saves API request returned not ok: " + response_user_saves.statusText);
        }
        list_saves_json = await response_user_saves.json();
        build_save_items()
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
});

// Build Saves List
function build_save_item (i){
    const save_li_parent = document.createElement("li");
    const save_li_div_parent = document.createElement("div");
    save_li_div_parent.setAttribute("class", "list_saves_item");
    save_li_div_parent.id = list_saves_json[i].uuid;

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
    save_li_div_label_div_div.style.backgroundColor = list_saves_json[i].color

    const save_li_div_label_div_div_parent = document.createElement("div");
    save_li_div_label_div_div_parent.classList.add("list_save_item_name-and-time");

    const save_li_div_label_div_div_p_name = document.createElement("p");
    save_li_div_label_div_div_p_name.classList.add("list_save_item_name");
    save_li_div_label_div_div_p_name.textContent = list_saves_json[i].name;

    const save_li_div_label_div_div_p_date = document.createElement("p");
    save_li_div_label_div_div_p_date.classList.add("list_save_item_date-time");
    save_li_div_label_div_div_p_date.textContent = `${list_saves_json[i].date} - ${list_saves_json[i].time}`;

    const save_li_div_p = document.createElement("p");
    save_li_div_p.classList.add("list_save_item_save");
    save_li_div_p.textContent = list_saves_json[i].save_reason;

    save_li_div_label_div_div_parent.appendChild(save_li_div_label_div_div_p_name);
    save_li_div_label_div_div_parent.appendChild(save_li_div_label_div_div_p_date);

    save_li_div_label_div_parent.appendChild(save_li_div_label_div_div);
    save_li_div_label_div_parent.appendChild(save_li_div_label_div_div_parent);

    save_li_div_label_parent.appendChild(save_li_div_label_div_parent);

    save_li_div_parent.appendChild(save_li_div_input);
    save_li_div_parent.appendChild(save_li_div_label_parent);
    save_li_div_parent.appendChild(save_li_div_p);
    save_li_parent.appendChild(save_li_div_parent);

    list_saves.appendChild(save_li_parent);
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
    list_saves.innerHTML += save_li_add;
}

// Important! Clear list of all child elements
function clear_list (list){
    while (list.firstChild) {
        list.removeChild(list.firstChild)
    }
}

function build_save_items(){
    clear_list(list_saves)
    build_save_add()
    add_new_save();
    for (let i = 0; i < list_saves_json.length; i++) {
        build_save_item(i)
    }
    selectionsaves()
}


// Open Add Project Window
function add_new_save() {
    const add_new_save_button = document.getElementById("add_new_save");
    const add_project_window_dimming = document.getElementById("add_project_window_dimming");
    const add_project_window = document.getElementById("add_project_window");

    add_new_save_button.addEventListener("click", () => {
        add_project_window_dimming.classList.toggle("hide");
        add_project_window.classList.toggle("hide");
    });
}
// Cancle Add Project Window

function cancle_add_new_save() {
    const add_project_window = document.getElementById("add_project_window");
    cancle_add_project_window.addEventListener("click", () => {
        add_project_window_dimming.classList.toggle("hide");
        add_project_window.classList.toggle("hide");
    })
}

// Call Open Add Project Window
document.addEventListener("DOMContentLoaded", () => {
    add_new_save();
    cancle_add_new_save();
});

// Build list of Players in preview
function build_player_preview(data, player_name){
    // Create Child Elements
    const properties_players_list = document.getElementById("properties_list_players_list")

    const properties_player = document.createElement("li")

    const properties_player_container = document.createElement("div")
    properties_player_container.classList.add("properties_list_player_item")

    const properties_player_indicator = document.createElement("div")
    properties_player_indicator.classList.add("properties_list_player_item_indicator")

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
function add_delete_option_for_players_in_preview() {
    save_preview_players_delete = document.querySelectorAll(".properties_list_player_item_delete")
    save_preview_players_delete.forEach(player_to_deltete_delete => {
        player_to_deltete_delete.addEventListener("click", () => {
            delete_player(player_to_deltete_delete)
            const player_to_delete_name = player_to_deltete_delete.parentElement.children[1].innerText
            if (selected_save_data_preview["players"][player_to_delete_name]){
                delete selected_save_data_preview["players"][player_to_delete_name]
                delete selected_save_data_preview.pairPerformance[player_to_delete_name];
                Object.keys(selected_save_data_preview.pairPerformance).forEach(pairPerformancePlayer => {
                    delete selected_save_data_preview.pairPerformance[pairPerformancePlayer][player_to_delete_name];
                })
                selected_save_data_preview["number of players"] -= 1;
                document.getElementById("properties_player_count_input").setAttribute("placeholder", selected_save_data_preview["number of players"])

            }
            else{
                console.error("Player to remove does not exist in the data")
            }
        })
    })
}

// Build new Pitch

function build_pitch(){
    const analyze_pitch_container = document.createElement("div")
    analyze_pitch_container.classList.add("analyze_results_pitch")

    const analyze_pitch_title = document.createElement("div")
    analyze_pitch_title.classList.add("analyze_pitch_title")

    const analyze_pitch_title_input = document.createElement("input")
    analyze_pitch_title_input.setAttribute("type", "text");
    analyze_pitch_title_input.classList.add("analyze_pitch_title_input")
    analyze_pitch_title_input.value = `Spielfeld ${document.querySelectorAll(".analyze_results_pitch").length + 1}`

    const analyze_pitch_delete = document.createElement("button")
    analyze_pitch_delete.classList.add("red_button")
    analyze_pitch_delete.classList.add("analyze_pitch_delete")
    analyze_pitch_delete.innerText = "Delete"
    analyze_pitch_delete.addEventListener("click", () => {
        analyze_pitch_container.remove()
        update_list_allocated_player()
        update_list_players()
        console.log(list_players)
        console.log(list_players_allocated)

    })

    const analyze_pitch_teams_container = document.createElement("div")
    analyze_pitch_teams_container.classList.add("analyze_pitch_teams")

    const analyze_pitch_teams_seperater = document.createElement("div")
    analyze_pitch_teams_seperater.classList.add("spacer_vertical_20px")

    // Build Pitch
    analyze_pitch_title.appendChild(analyze_pitch_title_input)
    analyze_pitch_title.appendChild(analyze_pitch_delete)
    
    analyze_pitch_teams_container.appendChild(build_team(1))
    analyze_pitch_teams_container.appendChild(analyze_pitch_teams_seperater)
    analyze_pitch_teams_container.appendChild(build_team(0))


    analyze_pitch_container.appendChild(analyze_pitch_title)
    analyze_pitch_container.appendChild(analyze_pitch_teams_container)
    return analyze_pitch_container
}

function build_team(number_to_devide_for_team_name){
    const analyze_pitch_team = document.createElement("div")
    analyze_pitch_team.classList.add("analyze_pitch_team")

    const analyze_pitch_team_title = document.createElement("div")
    analyze_pitch_team_title.classList.add("analyze_pitch_team_title")

    const analyze_pitch_team_title_input = document.createElement("input")
    analyze_pitch_team_title_input.setAttribute("type", "text")
    analyze_pitch_team_title_input.value = `Team ${(document.querySelectorAll(".analyze_results_pitch").length + 1)*2 - number_to_devide_for_team_name}`
    analyze_pitch_team_title_input.classList.add("analyze_pitch_team_title_input")

    const analyze_pitch_team_num_players = document.createElement("select")
    analyze_pitch_team_num_players.classList.add("analyze_pitch_team_num_players")

    const analyze_pitch_team_players = document.createElement("ul")
    analyze_pitch_team_players.classList.add("analyze_pitch_team_players")

    const analyze_pitch_team_add_player = document.createElement("div")
    analyze_pitch_team_add_player.classList.add("analyze_results_pitch_team_add_player")

    const analyze_pitch_team_add_player_symbol = document.createElement("img")
    analyze_pitch_team_add_player_symbol.setAttribute("src", "frontend/UI/img/icon/add.svg")
    analyze_pitch_team_add_player_symbol.setAttribute("alt", "Add Player to Team")
    analyze_pitch_team_add_player_symbol.classList.add("analyze_results_pitch_team_add_player_symbol")

    
    const analyze_pitch_team_add_player_selection = document.createElement("select")
    analyze_pitch_team_add_player_selection.classList.add("analyze_results_pitch_team_add_player_selection")

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

document.addEventListener("DOMContentLoaded", () => {
    const analyze_pitches = document.getElementById("analyze_results_pitches")
    document.getElementById("analyze_configure_add_pitch_button").addEventListener("click", () => {
        analyze_pitches.appendChild(build_pitch())
        update_pitches_selectors()
        add_player_to_team_eventlistener()
    })
})


function add_player_to_team (add_button) {
    const analyze_pitch_team_players_list = add_button.parentElement.parentElement.children[1]
    const analyze_pitch_team_add_player_selection = add_button.parentElement.children[1]

    const analyze_pitch_team_player = document.createElement("li")
    analyze_pitch_team_player.classList.add("analyze_pitch_team_player")

    const analyze_pitch_team_player_name = document.createElement("p")
    analyze_pitch_team_player_name.classList.add("analyze_pitch_team_player_name")
    analyze_pitch_team_player_name.innerText = analyze_pitch_team_add_player_selection.value

    const analyze_pitch_team_player_score = document.createElement("p")
    analyze_pitch_team_player_score.classList.add("analyze_pitch_team_player_score")
    analyze_pitch_team_player_score.innerText = selected_save_data_edit.players[analyze_pitch_team_add_player_selection.value].primaryScore // Add Score Function Later

    const analyze_pitch_team_player_delete_container = document.createElement("div")
    analyze_pitch_team_player_delete_container.classList.add("analyze_pitch_team_player_delete")
    const analyze_pitch_team_player_delete = document.createElement("img")
    analyze_pitch_team_player_delete.setAttribute("src", "frontend/UI/img/icon/close2.svg")
    analyze_pitch_team_player_delete.setAttribute("style", "height: 15px;")
    analyze_pitch_team_player_delete_container.addEventListener("click", () => {
        analyze_pitch_team_player.remove()
        update_list_allocated_player()
        update_list_players()
    })

    analyze_pitch_team_player_delete_container.appendChild(analyze_pitch_team_player_delete)

    analyze_pitch_team_player.appendChild(analyze_pitch_team_player_name)
    analyze_pitch_team_player.appendChild(analyze_pitch_team_player_score)
    analyze_pitch_team_player.appendChild(analyze_pitch_team_player_delete_container)

    analyze_pitch_team_players_list.appendChild(analyze_pitch_team_player)
    update_list_allocated_player()
    update_list_players()
};

function add_player_to_team_eventlistener(){
    add_buttons = document.querySelectorAll(".analyze_results_pitch_team_add_player_symbol")
    add_buttons.forEach(add_button => {
        if (add_button.dataset.EventListener !== "true"){
            add_button.addEventListener("click", () => {
                if (add_button.parentElement.children[1].value !== ""){
                    add_player_to_team (add_button)
                }
            })
            add_button.dataset.EventListener = "true"
        }
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

        const edit_player_table_player_attendance = document.createElement("td")
        edit_player_table_player_attendance.classList.add("edit_attendance")

        edit_player_table_player_attendance_button = document.createElement("div")
        edit_player_table_player_attendance_button.classList.add("button_activation_attendance")
        if (!selected_save_data["players"][player].attendanceState){
            edit_player_table_player_attendance_button.classList.add("red_deactivated")
        }

        edit_player_table_player_attendance.appendChild(edit_player_table_player_attendance_button)

        const edit_player_table_player_name = document.createElement("td")
        edit_player_table_player_name.classList.add("edit_name")

        const edit_player_table_player_name_input = document.createElement("textarea")
        edit_player_table_player_name_input.classList.add("table_input_text")
        edit_player_table_player_name_input.classList.add("table_input_name")
        edit_player_table_player_name_input.value = player

        edit_player_table_player_name.appendChild(edit_player_table_player_name_input)

        const edit_player_table_player_skill = document.createElement("td")
        const edit_player_table_player_skill_input = document.createElement("input")
        edit_player_table_player_skill_input.setAttribute("type", "number")
        edit_player_table_player_skill_input.setAttribute("value", player.primaryScore)
        edit_player_table_player_skill_input.classList.add("table_input_number")
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
//  Search
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("load_config").addEventListener("click", () => {
        if (selected_save_data == "") {
            show_message("No save selected: Please either select a saved project or create one", "warning")
        } else {
            selected_save_data = selected_save_data_preview
            selected_save_data_edit = selected_save_data_preview
            clear_player_table()
            build_player_table(selected_save_data)
            build_player_to_player_table(selected_save_data)
            document.getElementById("import_data_tab").classList.remove("active_tab")
            document.getElementById("edit_data_tab").classList.add("active_tab")
            AttendanceIndicatorPlayerTableEventListeners()
            
            apply_changes_to_data_name();
            apply_changes_to_attendance();
            apply_changes_to_skills();
            update_list_players();
        }
    })
})

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

document.addEventListener("DOMContentLoaded", () => {
    change_name_upon_change()
    change_description_upon_change()
    table_player_to_player_toggler_EventListener()
})

function build_player_to_player_table(selected_save_data){
    document.getElementById("table_player_to_player_thead").innerHTML = ""
    document.getElementById("table_player_to_player_tbody").innerHTML = ""
    build_player_to_player_table_thead(selected_save_data)
    build_player_to_player_table_tbody(selected_save_data)
    update_player_to_player_upon_change()
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
        player_to_player_thead_name.appendChild(player_to_player_thead_playername)
    })
    player_to_player_thead.appendChild(player_to_player_thead_name)
}

function build_player_to_player_table_tbody(selected_save_data){
    const player_to_player_tbody = document.getElementById("table_player_to_player_tbody")
    const players_pairPerformance = Object.keys(selected_save_data.pairPerformance);
    players_pairPerformance.forEach(player1 => {
        const player_to_player_tbody_player = document.createElement("tr")
        const player_to_player_tbody_player_name = document.createElement("td")
        player_to_player_tbody_player_name.classList.add("name_cell")
        player_to_player_tbody_player_name.innerText = player1;
        player_to_player_tbody_player.appendChild(player_to_player_tbody_player_name)
        players_pairPerformance.forEach(player2 => {
            const player_to_player_tbody_player_score = document.createElement("td")

            const player_to_player_tbody_player_score_input = document.createElement("input")
            player_to_player_tbody_player_score_input.setAttribute("type", "number")
            player_to_player_tbody_player_score_input.classList.add("table_input_number")
            player_to_player_tbody_player_score_input.classList.add("table_input_number_ptp")
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

function update_player_to_player_upon_change(){
    const build_player_to_player_table = document.getElementById("table_player_to_player")
    const player_to_player_input_cells = build_player_to_player_table.querySelectorAll(".table_input_number")
    player_to_player_input_cells.forEach(cell => {
        cell.addEventListener("change", () => {
            build_player_to_player_table.rows[cell.closest("td").cellIndex].cells[cell.closest("tr").rowIndex].children[0].value = cell.value
        })
    })
}

function apply_changes_to_data_name() {
    const list_player_names = Array.from(document.querySelectorAll(".table_input_name")).map(name_input => name_input.value)
    document.querySelectorAll(".table_input_name").forEach((input, index) => {
        input.addEventListener("change", () => {
            if (!list_player_names.includes(input.value)){
                const changed_name_index = input.parentElement.parentElement.rowIndex -1;
                const changed_name_previous_name = selected_save_data_edit.players[changed_name_index].name;
                const changed_name_new_name = input.value;

                // Apply changes in the analyze Tab
                apply_changes_to_players_in_teams(changed_name_previous_name, changed_name_new_name)

                selected_save_data_edit.players[changed_name_index].name = changed_name_new_name;

                selected_save_data_edit.pairPerformance[changed_name_new_name] = selected_save_data_edit.pairPerformance[changed_name_previous_name];
                delete selected_save_data_edit.pairPerformance[changed_name_previous_name];

                for (let player in selected_save_data_edit.pairPerformance){
                    if (player !== changed_name_new_name && selected_save_data_edit.pairPerformance[player][changed_name_previous_name] !== undefined){
                        selected_save_data_edit.pairPerformance[player][changed_name_new_name] = selected_save_data_edit.pairPerformance[player][changed_name_previous_name]
                        delete selected_save_data_edit.pairPerformance[player][changed_name_previous_name]
                    }
                }
                const table_player_to_player_thead_cell_changed_player = document.getElementById("table_player_to_player_thead").rows[0].cells[changed_name_index+1]
                if (table_player_to_player_thead_cell_changed_player.innerText == changed_name_previous_name){
                    table_player_to_player_thead_cell_changed_player.innerText = changed_name_new_name
                } else {
                    console.error("The name of the Player could not be found in the player-to-player table")
                }
                const table_player_to_player_tbody_cell_changed_player = document.getElementById("table_player_to_player_tbody").rows[changed_name_index].cells[0]
                if (table_player_to_player_tbody_cell_changed_player.innerText == changed_name_previous_name){
                    table_player_to_player_tbody_cell_changed_player.innerText = changed_name_new_name
                } else {
                    console.error("The name of the Player could not be found in the player-to-player table")
                }
            } else {
                show_message("Another Player already has that name. Please choose a different name", "warning")
            }
            
            list_player_names[index] = input.value
            update_list_players()
        });
    });
};

function apply_changes_to_attendance(){
    document.querySelectorAll(".button_activation_attendance").forEach((attendance_button, index) => {
        attendance_button.addEventListener("click", () => {
            selected_save_data_edit.players[index].attendanceState = !selected_save_data_edit.players[index].attendanceState
        })
    })
}

function apply_changes_to_skills(){
    document.querySelectorAll(".table_input_number").forEach(changed_input => {
        changed_input.addEventListener("change", () => {
            if (isNumericalNoDecimalNotEmpty(changed_input.value)){
                changed_input_row_Index = changed_input.closest("tr").rowIndex - 1
                if (changed_input.closest("td").cellIndex == 2){
                    selected_save_data_edit.players[Object.keys(selected_save_data_edit.players)[changed_input_row_Index]].primaryScore = Number(changed_input.value)
                } else if (changed_input.closest("td").cellIndex > 2){
                    changed_input_cell_Index = changed_input.closest("td").cellIndex - 2
                    const changed_categorie = document.getElementById("edit_player_table").rows[0].cells[changed_input_cell_Index + 2]
                    selected_save_data_edit.players[Object.keys(selected_save_data_edit.players)[changed_input_row_Index]].scores[changed_categorie.innerText] = Number(changed_input.value)
                } else {
                    show_message("The changes could not be applied", "warning")
                    console.error("The changed number could not be applied")
                }
                console.log(selected_save_data)
            } else {
                show_message("One Value is either empty or not a number. Please remove any letters or decimal points.", "warning")
            }
        })
    })
}

function apply_changes_to_skills_single_player(player){
    player.querySelectorAll(".table_input_number").forEach(changed_input => {
        changed_input.addEventListener("change", () => {
            if (isNumericalNoDecimalNotEmpty(changed_input.value)){
                changed_input_row_Index = changed_input.closest("tr").rowIndex - 1
                if (changed_input.closest("td").cellIndex == 2){
                    selected_save_data_edit.players[Object.keys(selected_save_data_edit.players)[changed_input_row_Index]].primaryScore = Number(changed_input.value)
                } else if (changed_input.closest("td").cellIndex > 2){
                    changed_input_cell_Index = changed_input.closest("td").cellIndex - 2
                    const changed_categorie = document.getElementById("edit_player_table").rows[0].cells[changed_input_cell_Index + 2]
                    selected_save_data_edit.players[Object.keys(selected_save_data_edit.players)[changed_input_row_Index]].scores[changed_categorie.innerText] = Number(changed_input.value)
                } else {
                    show_message("The changes could not be applied", "warning")
                    console.error("The changed number could not be applied")
                }
                console.log(selected_save_data)
            } else {
                show_message("One Value is either empty or not a number. Please remove any letters or decimal points.", "warning")
            }
        })
    })
}

var list_players = []
var list_players_allocated = []

function update_list_players(){
    list_players = Object.keys(selected_save_data_edit.players)
        .filter(player_name => player_name && !list_players_allocated.includes(player_name))
    update_pitches_selectors();
}

function update_list_allocated_player(){
    list_players_allocated = Array.from(document.querySelectorAll(".analyze_pitch_team_player_name")).map(name => name.innerText);
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

function apply_changes_to_players_in_teams(old_name, new_name){
    document.querySelectorAll(".analyze_pitch_team_player").forEach(li_item => {
        if (li_item.children[0].innerText == old_name){
            li_item.children[0].innerText = new_name
        }
    })
}
 // HERE
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("save_and_download_button").addEventListener("click", () => {
        let dl = document.createElement("a")
        dl.download = `${selected_save_data_edit.name}.json`
        dl.href = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(selected_save_data_edit))}`
        dl.click()
    })
    add_project_eventlistener()
})

const import_data_input = document.getElementById("json_import_input");

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
                number_players_property_save.setAttribute("placeholder", selected_save_data["number of players"]);
                description_property_save.value = selected_save_data["description"];

                Object.keys(selected_save_data.players).forEach(player_name => {
                    build_player_preview(selected_save_data, player_name)
                })

                add_delete_option_for_players_in_preview();
                AttendanceIndicatorPreviewEventListeners();

                selected_save_data_preview = selected_save_data;
                selected_save_data_edit = selected_save_data;
            } catch (e) {
                console.error("Error parsing JSON: ", e);
            }
        };
        reader.readAsText(file);
    }
});

// Todo
// Function to adjust the options for the numbers of Players selection per team so that if you choose a number of players for a team 
function addjust_num_player_selection(){
    var sum_numbers_selection = 0
    document.querySelectorAll(".analyze_pitch_team_num_players").forEach(selection => {
        selection.addEventListener("change", () => {
            sum_numbers_selection += selection.value
        })
        selection.querySelectorAll("option").forEach(option => {
        })
    })
}


// New Project Button
function add_project_eventlistener(){
    const default_new_project = {
        "name": "Project Name",
        "description": "Project Description",
        "color": "#ffffff",
        "number of players": 2,
        "matches":{},
        "teams":{},
        "settings":{
            "interachangableTeams": "True",
            "maxSittingOut": 2,
            "maxDifferenceTeams": 2,
            "maxDifferencePitches": 2,
            "auto-save": "False"
        },
        "categories":[],
        "players": {
            "player 1" : {
                "attendanceState": "True",
                "primaryScore": 0,
                "scores": {}
            },
            "player 2" : {
                "attendanceState": "True",
                "primaryScore": 0, 
                "scores": {}
            }
        },
        "pairPerformance": {
            "player 1": {
                "player 1" : 0,
                "player 2" : 1,
            },
            "player 2": {
                "player 1" : 1,
                "player 2" : 0,
            }
        }
    }
    document.getElementById("add_project").addEventListener("click", () => {
        default_new_project["name"] = document.getElementById("add_project_name_input").value;
        if (document.getElementById("add_project_autosave_option").classList.contains("checked")){
            default_new_project["settings"]["auto-save"] = "True"
        }
        default_new_project["description"] = document.getElementById("add_project_description_input").value;
        default_new_project["color"] = document.getElementById("project_color_input").value
        console.log(default_new_project)
        selected_save_data = default_new_project
        selected_save_data_preview = default_new_project
        console.log(selected_save_data_preview)

        const name_property_save = document.getElementById("properties_name_input");
        const number_players_property_save = document.getElementById("properties_player_count_input");
        const description_property_save = document.getElementById("properties_notes_input");

        name_property_save.value = selected_save_data_preview["name"];
        number_players_property_save.setAttribute("placeholder", selected_save_data_preview["number of players"]);
        description_property_save.value = selected_save_data_preview["description"];

        Object.keys(selected_save_data_preview.players).forEach(player_name => {
            build_player_preview(selected_save_data_preview, player_name)
    })

        add_delete_option_for_players_in_preview();
        AttendanceIndicatorPreviewEventListeners();
        document.getElementById("add_project_window_dimming").classList.toggle("hide");
        document.getElementById("add_project_window").classList.toggle("hide");
        selected_save_data = selected_save_data_preview
    })
}


function analyze(project){
    const analyze_project = gather_project_data_settings(project)
    analyze_project = gather_project_data_teams_matches(analyze_project)
}

function gather_project_data_settings(project){
    analyze_tab_settings = document.getElementById("analyze_settings_interchangeable_toggle_container")
    project.settings.maxSittingOut = parseInt(analyze_tab_settings.getElementById("analyze_settings_max_sit_out_players").value)
    project.settings.maxDifferenceTeams = parseInt(analyze_tab_settings.getElementById("analyze_settings_max_difference_teams").value)
    project.settings.maxDifferencePitches = parseInt(analyze_tab_settings.getElementById("analyze_settings_max_difference_pitches").value)
    if (document.getElementById("analyze_settings_interchangeable_toggle").classList.contains("checked")){
        project.settings.interachangableTeams = "True"
    } else {
        project.settings.interachangableTeams = "False"
    }
    return project
}

function gather_project_data_teams_matches(project){

    // extract which players are allocated to which team and set the set teams size
    anaylze_tab = document.getElementById("analysis_tab")
    analyze_tab.querySelectorAll(".analyze_pitch_team").forEach(team_box => {
        project.teams[team_box.querySelector(".analyze_pitch_team_title_input").value] = {
            "num_players": (() => {
                const selectedValue = team_box.querySelector(".analyze_pitch_team_num_players").value;
                return selectedValue === "a" ? "None" : selectedValue;
            })(),
            "players": Array.from(team_box.querySelectorAll(".analyze_pitch_team_player_name")).map(player_name => player_name.innerText)
        }
    })

    const team_names = Array.from(anaylze_tab.querySelectorAll(".analyze_pitch_team_title_input"))

    for (let i = 0; i < team_names.length; i += 2){
        project.matches[team_names[i]] = team_names[i+1]
    }
    return project
    
}

function verify_project(project){
    const [players_valid, players_names] = verify_project_players(project)
    if (players_valid){
        if (verify_categories(project)){
            if (verify_settings(project)){
                if (verify_player_to_player(project, players_names)){
                    if (verify_teams_and_matches(project)){
                        show_message("The project data is valid and will be processed", "success")
                    }
                }
            }
        }
    }
}

function verify_project_players(project){
    players = project["players"]
    const player_count = 0;
    const players_invalid_primary_score = []
    const player_count_invalid_primary_score = 0
    const players_names = []
    Object.keys(players).forEach(player_name => {
        if (typeof(players[player_name].primaryScore) !== "number"){
            players_invalid_primary_score.push(player_name);
            player_count_invalid_primary_score ++;
        }
        players_names.push(player_name)
        player_count ++;
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
        show_message("There has been an unkown error during validation of you projects data. Please try again.", "warning")
        console.error("There has been an unkown error during validation of you projects data. Please try again.")
        return false
    }
    if (player_count != project["number of players"]){
        show_message("The amount of players with data does not match the number of players. This will be fixed automatically", "info")
        console.log("The amount of players with data does not match the number of players. This will be fixed automatically")
        return false
    }
    return [true, players_names]
}

function verify_categories(project){
    categories = project["categories"]
    players = project["players"]

    const player_count_missing_categories = 0
    const players_too_small_or_too_large_categorie_scores = [] // Remove duplicates
    const player_count_too_small_or_too_large_categorie_scores = 0

    categories.forEach(categorie => {
        Object.keys(players).forEach(player_name => {
            if (!project.players[player_name].scores[categorie.name] || typeof(project.players[player_name].scores[categorie.name]) != "number"){
                player_count_missing_categories ++;
            } else if (typeof(categorie.minimumValue) == "number") {
                if (project.players[player_name].scores[categorie.name] < categorie.minimumValue){
                    players_too_small_or_too_large_categorie_scores.push(player_name)
                    player_count_too_small_or_too_large_categorie_scores ++;
                } else if (typeof(categorie.maximumValue) == "number"){
                    if (project.players[player_name].scores[categorie.name] < categorie.maximumValue){
                        players_too_small_or_too_large_categorie_scores.push(player_name)
                        player_count_too_small_or_too_large_categorie_scores ++;
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

    if (player_count_too_small_or_too_large_categorie_scores > 0){
        show_message(`The players ${players_too_small_or_too_large_categorie_scores} have either too large or too small scores in one or more categorie`, "warning")
        console.error(`The players ${players_too_small_or_too_large_categorie_scores} have either too large or too small scores in one or more categorie`)
        return false
    }
    return true
}

function verify_settings(project){
    settings = project["settings"]

    if (typeof(settings.interachangableTeams) != "boolean"){
        show_message("The 'interchangable Teams' option is neither on nor off. Please tick this setting off or on to fit your needs.", "warning")
        console.error("The 'interchangable Teams' option is neither on nor off. Please tick this setting off or on to fit your needs.")
        return false
    }

    if (typeof(settings.maxSittingOut) != "number" || settings.maxSittingOut < 0){
        show_message("The input for the maximum amount of players sitting out is either not a number or is smaller then 0", "warning")
        console.error("The input for the maximum amount of players sitting out is either not a number or is smaller then 0")
        return false
    }

    if (typeof(settings.maxDifferenceTeams) != "number" || settings.maxDifferenceTeams < 0){
        show_message("The input for the maximum difference in amount of players between teams option is either not a number or is smaller then 0", "warning")
        console.error("The input for the maximum difference in amount of players between teams option is either not a number or is smaller then 0")
        return false
    }

    if (typeof(settings.maxDifferencePitches) != "number" || settings.maxDifferencePitches < 0){
        show_message("The input for the maximum difference in amount of players between pitches option is either not a number or is smaller then 0", "warning")
        console.error("The input for the maximum difference in amount of players between pitches option is either not a number or is smaller then 0")
        return false
    }

    if (typeof(settings.auto-save) != "boolean"){
        show_message("The 'auto-save' option is neither on nor off. Please tick this setting off or on to fit your needs.", "warning")
        console.error("The 'auto-save' option is neither on nor off. Please tick this setting off or on to fit your needs.")
        return false
    }

    return  true
}

function verify_player_to_player(project, players_names){
    pairPerformance = project["pairPerformance"]

    const players_missing_in_pairPerformance = []
    const count_players_missing_from_pairPerformance = 0;

    const players_missing_in_players_pair_performance = []
    const count_players_missing_in_players_pair_performance = 0

    const players_invalid_pair_performance = []
    const count_players_invalid_pair_performance = 0

    players_names.forEach(player_name => {
        if (!pairPerformance[player_name]){
            players_missing_in_pairPerformance.push(players_names)
            count_players_missing_from_pairPerformance ++;
        }
        players_names.forEach(pair_player_name => {
            if (!pairPerformance[player_name][pair_player_name]){
                players_missing_in_players_pair_performance.push(player_name)
                players_missing_in_players_pair_performance.push(pair_player_name)
                count_players_missing_in_players_pair_performance ++
            } else if(typeof(pairPerformance[player_name][pair_player_name]) != "number"){
                players_invalid_pair_performance.push(player_name)
                players_invalid_pair_performance.push(pair_player_name)
                count_players_invalid_pair_performance ++
            }
        })
    })

    if (count_players_missing_from_pairPerformance > 0){
        show_message(`The players ${players_missing_in_pairPerformance} are missing from the pairPerformance. Assure that they have a relationship status.`, "warning")
        console.error(`The players ${players_missing_in_pairPerformance} are missing from the pairPerformance. Assure that they have a relationship status.`)
        return false
    }
    if (count_players_missing_in_players_pair_performance > 0){
        players_missing_in_players_pair_performance = [...new Set(players_missing_in_players_pair_performance)];
        show_message(`The players ${players_missing_in_players_pair_performance} do not have a value representing their relationship`, "warning")
        console.error(`The players ${players_missing_in_players_pair_performance} do not have a value representing their relationship`)
        return false
    }
    if (count_players_invalid_pair_performance > 0){
        players_invalid_pair_performance = [...new Set(players_invalid_pair_performance)];
        show_message(`The players ${players_missing_in_players_pair_performance} pair relationship value is invalid`, "warning")
        console.error(`The players ${players_missing_in_players_pair_performance} pair relationship value is invalid`)
        return false
    }

    return true
}

function verify_teams_and_matches(project){
    const teams = project.teams
    const matches = project.matches
    const players = project.players

    const teams_names = []
    const teams_invalid_num_players = []
    const count_teams_invalid_num_players = 0;

    const teams_unkown_player_allocation = []
    const count_teams_unkown_player_allocation = 0

    Object.keys(teams).forEach(team_name => {
        teams_names.push(team_name)
        if (project.teams[team_name]["num_players"] != "None" && typeof(project.teams[team_name]["num_players"]) != "number"){
            teams_invalid_num_players.push(team_name)
            count_teams_invalid_num_players ++
        }
        project.teams[team_name]["players"].forEach(player_name =>{
            if (!players[player_name]){
                teams_unkown_player_allocation.push(player_name)
                count_teams_unkown_player_allocation ++
            }
        })
    })

    const unkown_team_in_matches = []
    const count_unkown_team_in_matches = 0

    teams_names.forEach(team_name => {
        if (!matches[team_name] || !teams[matches[team_name]]){
            unkown_team_in_matches.push(team_name)
            count_unkown_team_in_matches ++
        }
    })

    if (count_teams_invalid_num_players > 0){
        show_message(`The teams ${teams_invalid_num_players} have an invalid value for their team size. Make sure the team size is either not set or set to a number`, "warning")
        console.error(`The teams ${teams_invalid_num_players} have an invalid value for their team size. Make sure the team size is either not set or set to a number`)
        return false
    }
    if (count_teams_unkown_player_allocation > 0){
        show_message(`To the teams ${teams_unkown_player_allocation} players not in the project were allocated. Make sure all players allocated to a team are also present in the project`, "warning")
        console.error(`To the teams ${teams_unkown_player_allocation} players not in the project were allocated. Make sure all players allocated to a team are also present in the project`)
        return false
    }
    if (count_unkown_team_in_matches > 0){
        show_message(`The teams ${unkown_team_in_matches} either not exist or their opponent does not exist. Make sure the teams are named properly`, "warning")
        console.error(`The teams ${unkown_team_in_matches} either not exist or their opponent does not exist. Make sure the teams are named properly`)
        return false
    }
    return true
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("edit_data_tab_analyze_tab").addEventListener("click", () => {
        document.getElementById("edit_data_tab").classList.remove("active_tab")
        document.getElementById("analysis_tab").classList.add("active_tab")
    })
})