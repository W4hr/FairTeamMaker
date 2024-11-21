#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <cstdlib>
#include <queue>
#include <utility>
#include <random>
#include <sstream>
#include <unordered_set>
#include <string>

#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

namespace py = pybind11;

struct GameCombination{
    double difference;
    std::vector<std::vector<int>> teams;
    std::vector<double> teams_scores;
    std::string string_teams;
};

struct compareGameCombination{
    bool operator()(const GameCombination& a, const GameCombination& b){
        return a.difference < b.difference;
    }
};

struct GamesCombinations{
    std::vector<int> teams_sizes;
    std::vector<GameCombination> possible_games;
};

class GenerateCombination {
    public:
    GenerateCombination(const std::vector<int>& input, int combination_size)
        : input(input), combination_size(combination_size), n(input.size()) {
        bitmap = std::vector<bool>(combination_size, true);
        bitmap.resize(n, false);
        has_next_combination = true;
    }

    bool next_combination(std::vector<int>& combination) {
        if (!has_next_combination) {
            return false;
        }
        combination.clear();
        for (int i = 0; i < n; ++i) {
            if (bitmap[i]) {
                combination.push_back(input[i]);
            }
        }
        has_next_combination = std::next_permutation(bitmap.begin(), bitmap.end());

        return true;
    }

    private:
    std::vector<int> input;
    int combination_size;
    int n;
    std::vector<bool> bitmap;
    bool has_next_combination;
};

// Fast alternative would be to hash but less readable
std::string serialize(std::vector<std::vector<int>>& game){
    for (auto& team : game){
        std::sort(team.begin(), team.end());
    }

    std::sort(game.begin(), game.end());
    std::stringstream stringified;
    for (auto& team : game){
        for (int i = 0; i < team.size(); i++){
            stringified << team[i];
            if (i < team.size() - 1) stringified << ",";
        }
        stringified << ";";
    }
    return stringified.str();
}

bool isduplicate(std::string string_teams, std::unordered_set<std::string>& existing_combinations){
    return existing_combinations.find(string_teams) != existing_combinations.end();
}

py::dict convert_result_to_dict(const GamesCombinations& possible_games_team_size){
    py::dict result_team_size;
    result_team_size["teams_sizes"] = possible_games_team_size.teams_sizes;
    std::vector<py::dict> possible_games;
    for(const GameCombination& possible_game : possible_games_team_size.possible_games){
        py::dict possible_game_dict;
        possible_game_dict["teams"] = possible_game.teams;
        possible_game_dict["difference"] = possible_game.difference;
        possible_game_dict["teams_scores"] = possible_game.teams_scores;
        possible_games.push_back(possible_game_dict);
    }
    result_team_size["possible_games"] = possible_games;
    return result_team_size;
}

std::vector<py::dict> convert_results_to_dict(const std::vector<GamesCombinations> best_games){
    std::vector<py::dict> results;
    for (const auto& possible_games_team_size : best_games){
        results.push_back(convert_result_to_dict(possible_games_team_size));
    }
    return results;
}

std::tuple<double, std::vector<double>> calculate_score_difference(std::vector<std::vector<int>> game, std::vector<std::vector<int>> players_allocated_teams, std::vector<double> player_scores, std::vector<std::vector<double>> player_to_player) {
    std::vector<std::vector<int>> combined_teams;
    combined_teams.reserve(game.size());
    for (size_t i = 0; i < game.size(); ++i) {
        std::vector<int> team;
        team.reserve(game[i].size() + players_allocated_teams[i].size());
        team.insert(team.end(), game[i].begin(), game[i].end());
        team.insert(team.end(), players_allocated_teams[i].begin(), players_allocated_teams[i].end());
        combined_teams.emplace_back(std::move(team));
    }

    std::vector<double> team_scores;
    for (size_t t = 0; t < combined_teams.size(); ++t) {
        double team_score = 0;
        for (size_t p = 0; p < combined_teams[t].size(); ++p) {
            team_score += player_scores[combined_teams[t][p]];
        }
        team_scores.push_back(team_score);
    }

    std::vector<double> player_to_player_scores_teams;
    for (size_t t = 0; t < combined_teams.size(); ++t) {
        double player_to_player_scores_team = 0;
        for (size_t p_o = 0; p_o < combined_teams[t].size(); p_o++) {
            for (size_t p_p = 0; p_p < combined_teams[t].size(); p_p++) {
                player_to_player_scores_team += player_to_player[combined_teams[t][p_o]][combined_teams[t][p_p]];
            }
        }
        player_to_player_scores_teams.push_back(player_to_player_scores_team);
    }

    std::vector<double> game_scores;
    for (size_t t = 0; t < team_scores.size(); ++t) {
        game_scores.push_back(team_scores[t] + player_to_player_scores_teams[t]);
    }

    double difference_scores = 0;

    for (size_t t = 0; t < game_scores.size(); t += 2) {
        difference_scores += std::fabs(game_scores[t] - game_scores[t + 1]);
    }

    return std::make_tuple(difference_scores, game_scores);
}

// Brute Force Algorythm

std::vector<py::dict> brute_force(
    const std::vector<std::vector<int>>& team_sizes,
    const std::vector<int>& amount_of_tries,
    const std::vector<std::vector<int>>& players_allocated_teams,
    const std::vector<double>& player_data,
    std::vector<int>& indexes_players_unallocated,
    int len_leaderboard,
    const std::vector<std::vector<double>>& player_to_player
    ){
    std::vector<GamesCombinations> best_games;

    for (size_t i = 0; i < amount_of_tries.size(); ++i) {
        std::vector<int> current_teams_sizes = team_sizes[i];
        std::vector<std::vector<int>> teams;
        int tries = 0;
        std::sort(indexes_players_unallocated.begin(), indexes_players_unallocated.end());

        std::priority_queue<GameCombination, std::vector<GameCombination>, compareGameCombination> top_vector;
        std::vector<GameCombination> best_games_each_size;
        std::unordered_set<std::string> existing_combinations;
        double game_difference;
        std::vector<double> game_scores;

        int players_needed = std::accumulate(current_teams_sizes.begin(), current_teams_sizes.end(), 0);

        if (players_needed == indexes_players_unallocated.size()) {
            do {
                teams.clear();
                int start = 0;
                for (auto team_size = current_teams_sizes.begin(); team_size != current_teams_sizes.end(); ++team_size) {
                    std::vector<int> team(indexes_players_unallocated.begin() + start, indexes_players_unallocated.begin() + start + *team_size);
                    teams.push_back(team);
                    start += *team_size;
                }
                std::tie(game_difference, game_scores) = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player);

                if (top_vector.size() < len_leaderboard || game_difference < top_vector.top().difference) {
                    std::string string_teams = serialize(teams);
                    if (!isduplicate(string_teams, existing_combinations)){
                        GameCombination possible_game;
                        possible_game.difference = game_difference;
                        possible_game.teams = teams;
                        possible_game.teams_scores = game_scores;
                        possible_game.string_teams = string_teams;
                        top_vector.push(possible_game);
                        existing_combinations.insert(string_teams);

                        if (top_vector.size() > len_leaderboard) {
                            std::string worse_game_hash = top_vector.top().string_teams;
                            top_vector.pop();
                            existing_combinations.erase(worse_game_hash);
                        }
                    }
                }
                tries++;
            } while (tries < amount_of_tries[i] && std::next_permutation(indexes_players_unallocated.begin(), indexes_players_unallocated.end()));
            while (!top_vector.empty()) {
                best_games_each_size.push_back(top_vector.top());
                top_vector.pop();
            }
            GamesCombinations gc;
            gc.possible_games = best_games_each_size;
            gc.teams_sizes = current_teams_sizes;
            best_games.push_back(gc);
            best_games_each_size.clear();
        } else if (players_needed < indexes_players_unallocated.size()) {
            GenerateCombination combination_generator(indexes_players_unallocated, players_needed);
            std::vector<int> combination;

            while (tries < amount_of_tries[i] && combination_generator.next_combination(combination)) {
                while (std::next_permutation(combination.begin(), combination.end()) && tries < amount_of_tries[i]) {
                    int start = 0;
                    teams.clear();
                    for (auto team_size = current_teams_sizes.begin(); team_size != current_teams_sizes.end(); ++team_size) {
                        std::vector<int> team(combination.begin() + start, combination.begin() + start + *team_size);
                        teams.push_back(team);
                        start += *team_size;
                    }
                    std::tie(game_difference, game_scores) = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player);

                    if (top_vector.size() < len_leaderboard || game_difference < top_vector.top().difference) {
                        std::string string_teams = serialize(teams);
                        if (!isduplicate(string_teams, existing_combinations)){
                            GameCombination possible_game;
                            possible_game.difference = game_difference;
                            possible_game.teams = teams;
                            possible_game.teams_scores = game_scores;
                            possible_game.string_teams = string_teams;
                            top_vector.push(possible_game);
                            existing_combinations.insert(string_teams);

                            if (top_vector.size() > len_leaderboard) {
                                std::string worse_game_hash = top_vector.top().string_teams;
                                top_vector.pop();
                                existing_combinations.erase(worse_game_hash);
                            }
                        }
                    }
                    tries++;
                }
            }
            while (!top_vector.empty()) {
                best_games_each_size.push_back(top_vector.top());
                top_vector.pop();
            }
            GamesCombinations gc;
            gc.possible_games = best_games_each_size;
            gc.teams_sizes = current_teams_sizes;
            best_games.push_back(gc);
            best_games_each_size.clear();
        }
    }
    // convert to python compatible dictionary:
    std::vector<py::dict> result_dict = convert_results_to_dict(best_games);

    return result_dict;
}

// random
std::vector<py::dict> random(
    const std::vector<std::vector<int>>& team_sizes,
    const std::vector<int>& amount_of_tries,
    const std::vector<std::vector<int>>& players_allocated_teams,
    const std::vector<double>& player_data,
    std::vector<int>& indexes_players_unallocated,
    int len_leaderboard,
    const std::vector<std::vector<double>>& player_to_player
) {
    std::vector<GamesCombinations> best_games;
    
    std::random_device rd;
    std::default_random_engine rng(rd());

    for (size_t i = 0; i < amount_of_tries.size(); ++i) {
        std::vector<int> current_teams_sizes = team_sizes[i];
        std::vector<std::vector<int>> teams;
        int tries = 0;
        std::sort(indexes_players_unallocated.begin(), indexes_players_unallocated.end());

        std::priority_queue<GameCombination, std::vector<GameCombination>, compareGameCombination> top_vector;
        std::vector<GameCombination> best_games_each_size;
        std::unordered_set<std::string> existing_combinations;
        double game_difference;
        std::vector<double> game_scores;

        int players_needed = std::accumulate(current_teams_sizes.begin(), current_teams_sizes.end(), 0);

        if (players_needed == indexes_players_unallocated.size()) {
            do {
                std::shuffle(indexes_players_unallocated.begin(), indexes_players_unallocated.end(), rng);
                teams.clear();
                int start = 0;
                for (auto team_size = current_teams_sizes.begin(); team_size != current_teams_sizes.end(); ++team_size) {
                    std::vector<int> team(indexes_players_unallocated.begin() + start, indexes_players_unallocated.begin() + start + *team_size);
                    teams.push_back(team);
                    start += *team_size;
                }
                std::tie(game_difference, game_scores) = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player);

                if (top_vector.size() < len_leaderboard || game_difference < top_vector.top().difference) {
                    std::string string_teams = serialize(teams);
                    if (!isduplicate(string_teams, existing_combinations)){
                        GameCombination possible_game;
                        possible_game.difference = game_difference;
                        possible_game.teams = teams;
                        possible_game.teams_scores = game_scores;
                        possible_game.string_teams = string_teams;
                        top_vector.push(possible_game);
                        existing_combinations.insert(string_teams);

                        if (top_vector.size() > len_leaderboard) {
                            std::string worse_game_hash = top_vector.top().string_teams;
                            top_vector.pop();
                            existing_combinations.erase(worse_game_hash);
                        }
                    }
                }
                tries++;
            } while (tries < amount_of_tries[i]);
            while (!top_vector.empty()) {
                best_games_each_size.push_back(top_vector.top());
                top_vector.pop();
            }
            GamesCombinations gc;
            gc.possible_games = best_games_each_size;
            gc.teams_sizes = current_teams_sizes;
            best_games.push_back(gc);
            best_games_each_size.clear();
        } else if (players_needed < indexes_players_unallocated.size()) {
            GenerateCombination combination_generator(indexes_players_unallocated, players_needed);
            std::vector<int> combination;

            while (tries < amount_of_tries[i] && combination_generator.next_combination(combination)) {
                while (tries < amount_of_tries[i]) {
                    std::shuffle(indexes_players_unallocated.begin(), indexes_players_unallocated.end(), rng);
                    int start = 0;
                    teams.clear();
                    for (auto team_size = current_teams_sizes.begin(); team_size != current_teams_sizes.end(); ++team_size) {
                        std::vector<int> team(combination.begin() + start, combination.begin() + start + *team_size);
                        teams.push_back(team);
                        start += *team_size;
                    }
                    std::tie(game_difference, game_scores) = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player);

                    if (top_vector.size() < len_leaderboard || game_difference < top_vector.top().difference) {
                        std::string string_teams = serialize(teams);
                        if (!isduplicate(string_teams, existing_combinations)){
                            GameCombination possible_game;
                            possible_game.difference = game_difference;
                            possible_game.teams = teams;
                            possible_game.teams_scores = game_scores;
                            possible_game.string_teams = string_teams;
                            top_vector.push(possible_game);
                            existing_combinations.insert(string_teams);

                            if (top_vector.size() > len_leaderboard) {
                                std::string worse_game_hash = top_vector.top().string_teams;
                                top_vector.pop();
                                existing_combinations.erase(worse_game_hash);
                            }
                        }
                    }
                    tries++;
                }
            }
            while (!top_vector.empty()) {
                best_games_each_size.push_back(top_vector.top());
                top_vector.pop();
            }
            GamesCombinations gc;
            gc.possible_games = best_games_each_size;
            gc.teams_sizes = current_teams_sizes;
            best_games.push_back(gc);
            best_games_each_size.clear();
        }
    }
    // convert to python compatible dictionary:
    std::vector<py::dict> result_dict = convert_results_to_dict(best_games);

    return result_dict;
}

PYBIND11_MODULE(game_calculator, m) {
    m.doc() = "Game Calculator Module";

    m.def("brute_force", &brute_force, "Generate possible games using brute force",
        py::arg("team_sizes"),
        py::arg("amount_of_tries"),
        py::arg("players_allocated_teams"),
        py::arg("player_data"),
        py::arg("indexes_players_unallocated"),
        py::arg("len_leaderboard"),
        py::arg("player_to_player")
    );

    m.def("random", &random, "Generate possible games using random shuffling",
        py::arg("team_sizes"),
        py::arg("amount_of_tries"),
        py::arg("players_allocated_teams"),
        py::arg("player_data"),
        py::arg("indexes_players_unallocated"),
        py::arg("len_leaderboard"),
        py::arg("player_to_player")
    );
}
