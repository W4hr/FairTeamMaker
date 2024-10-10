#include <iostream>
#include <vector>
#include <map>
#include <algorithm>

// using namespace std;


// | Feature            | Array                     | Vector                    | List (std::list)            |
// |--------------------|---------------------------|---------------------------|-----------------------------|
// | Size               | Fixed                     | Dynamic                   | Dynamic                     |
// | Memory Layout      | Contiguous                | Contiguous                | Non-contiguous (linked)     |
// | Access Time        | O(1) for index access     | O(1) for index access     | O(n) for index access       |
// | Insertion/Removal  | Inefficient (requires     | Efficient at the end      | Efficient anywhere (O(1))   |
// |                    | shifting)                 | (amortized O(1))          |                             |
// | Functionality      | Minimal (no built-in      | Rich (push_back, size,    | Rich (push_front, pop_back, |
// |                    | methods)                  | etc.)                     | etc.)                       |

int calculate_calculate_score_difference(std::vector<std::vector<int>> game, std::vector<std::vector<int>> players_allocated_teams, std::vector<double> player_scores, std::vector<std::vector<int>> plyerTOplayer){
    std::vector<int> team_scores;


// Merge possible_game (game) and the allocated players (players_allocated_teams) into one for ease of calculation
    std::vector<std::vector<int>> combined_teams;
    combined_teams.reserve(game.size());
    for (size_t i = 0; i < game.size(); ++i){
        std::vector<int> team;
        team.reserve(game[i].size() + players_allocated_teams[i].size());
        team.insert(team.end(), game[i].begin(), game[i].end());
        team.insert(team.end(), players_allocated_teams[i].begin(), players_allocated_teams[i].begin());
        combined_teams.emplace_back(std::move(team));
    };

    for ()
};

int main(){
    std::vector<std::vector<int>> team_sizes = { // Pair teams that are facing each other in 
            {5, 6, 7, 5},
            {2, 9, 6, 6},
            {8, 4, 4, 7},
            {3, 5, 10, 5},
            {1, 1, 11, 10}
        };

    std::vector<int> amount_of_tries = {31000, 24000, 11000, 3000, 500};

    std::vector<std::vector<int>> players_allocated_teams = { // Indexes for players in vector each vector representing a team
        {2, 5},
        {},
        {6,9,10},
        {}
    };

    std::vector<double> PlayerData = {1.342251, 2.173312}; // All players via index

    std::vector<int> indexesPlayersUnAllocated = {0, 1, 3, 4, 7, 8}; // List of Indexes of players not allocated

    int len_leaderboard; // Amount of games

    std::map<int, std::vector<double>> playerTOplayer;
    playerTOplayer[0] = {0, 2, 1, 0, 0, 0}; // Playerindex and then list each number's index in the vector representing the player and the value representing the relationship

    for(size_t i = 0; i < amount_of_tries.size(); ++i){
        std::vector<int> current_teams_sizes = team_sizes[i];
        std::vector<std::vector<int>> teams;
        int tries = 0;
        std::sort(indexesPlayersUnAllocated.begin(), indexesPlayersUnAllocated.end());
        while (tries < amount_of_tries[i]){
            teams.clear();
            int start = 0;
            std::next_permutation(indexesPlayersUnAllocated.begin(), indexesPlayersUnAllocated.end());
            for (auto team_size = current_teams_sizes.begin(); team_size != current_teams_sizes.end(); ++team_size){
                std::vector<int> team(indexesPlayersUnAllocated.begin() + start, indexesPlayersUnAllocated.begin() + start + team_size)
                teams.push_back(team);
                start += team_size;
            };
            calculate_score_difference()
        };
    };
};