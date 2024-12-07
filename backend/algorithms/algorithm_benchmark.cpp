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

#include <chrono> // For benchmark time

#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

namespace py = pybind11;

struct BenchmarkResult{
    double difference;
    int iteration;
    long calculation_time;
};

struct GameCombination{
    double difference;
    std::string string_teams;
};

// convert data to py::dict - python dictionary
py::dict BenchmarkResult_to_dict(const BenchmarkResult& result){
    py::dict dict;
    dict["difference"] = result.difference;
    dict["calculation_time"] = result.calculation_time;
    dict["iteration"] = result.iteration;
    return dict;
}

std::vector<std::vector<py::dict>> BenchmarkResults_to_dict(const std::vector<std::vector<BenchmarkResult>> results_struct){
    std::vector<std::vector<py::dict>> results_dict;
    for (const auto& team_size_results : results_struct){
        std::vector<py::dict> result_dict;
        for (const auto& result : team_size_results){
            result_dict.push_back(BenchmarkResult_to_dict(result));
        }
        results_dict.push_back(result_dict);
    }
    return results_dict;
}

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

std::tuple<double, std::vector<double>> calculate_score_difference(std::vector<std::vector<int>> game, std::vector<std::vector<int>> players_allocated_teams, std::vector<double> player_scores, std::vector<std::vector<double>> player_to_player, double (*difference_function)(std::vector<double>)) {
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

    double difference_scores = difference_function(game_scores);

    return std::make_tuple(difference_scores, game_scores);
}

double calculate_difference(std::vector<double> game_scores){
    double difference_scores = 0;

    for (size_t t = 0; t < game_scores.size(); t += 2) {
        difference_scores += std::fabs(game_scores[t] - game_scores[t + 1]);
    }
    return difference_scores;
}

double calculate_interchangeble_difference(std::vector<double> game_scores){
    double difference_scores = 0;

    for (size_t t = 0; t < game_scores.size(); t++) {
        for (size_t i = 0; i < game_scores.size(); i++){
            difference_scores += std::fabs(game_scores[t] - game_scores[i]);
        }
    }
    return difference_scores;
}

// Brute Force Algorythm

std::vector<std::vector<py::dict>> brute_force(
    const std::vector<std::vector<int>>& team_sizes,
    const std::vector<int>& amount_of_tries,
    const std::vector<std::vector<int>>& players_allocated_teams,
    const std::vector<double>& player_data,
    std::vector<int>& indexes_players_unallocated,
    int len_leaderboard,
    const std::vector<std::vector<double>>& player_to_player,
    bool interchangeable
    ){        
    std::vector<std::vector<BenchmarkResult>> performance_all_teams;

    double (*difference_function)(std::vector<double>) = interchangeable? calculate_interchangeble_difference : calculate_difference;

    for (size_t i = 0; i < amount_of_tries.size(); ++i) {
        std::vector<int> current_teams_sizes = team_sizes[i];
        std::vector<std::vector<int>> teams;
        int tries = 0;
        std::sort(indexes_players_unallocated.begin(), indexes_players_unallocated.end());

        std::priority_queue<double> top_vector;
        std::unordered_set<std::string> existing_combinations;
        double game_difference;
        std::vector<double> game_scores;
        BenchmarkResult result; 
        std::vector<BenchmarkResult> results;

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
                auto start_calculation = std::chrono::high_resolution_clock::now();
                std::tie(game_difference, game_scores) = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player, difference_function);
                auto end_calculation = std::chrono::high_resolution_clock::now();
                if (top_vector.size() < len_leaderboard || game_difference < top_vector.top()) {
                    std::string string_teams = serialize(teams);
                    if (!isduplicate(string_teams, existing_combinations)){
                        top_vector.push(game_difference);
                        existing_combinations.insert(string_teams);
                        BenchmarkResult result;
                        result.difference = game_difference;
                        result.iteration = tries;
                        result.calculation_time = std::chrono::duration_cast<std::chrono::microseconds>(end_calculation - start_calculation).count();
                        results.push_back(result);
                        if (top_vector.size() > len_leaderboard) {
                            top_vector.pop();
                        }
                    }
                }
                tries++;
            } while (tries < amount_of_tries[i] && std::next_permutation(indexes_players_unallocated.begin(), indexes_players_unallocated.end()));
            top_vector = std::priority_queue<double>();
            performance_all_teams.push_back(results);
            results.clear();
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
                    auto start_calculation = std::chrono::high_resolution_clock::now();
                    std::tie(game_difference, game_scores) = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player, difference_function);
                    auto end_calculation = std::chrono::high_resolution_clock::now();

                    if (top_vector.size() < len_leaderboard || game_difference < top_vector.top()) {
                        std::string string_teams = serialize(teams);
                        if (!isduplicate(string_teams, existing_combinations)){
                            top_vector.push(game_difference);
                            existing_combinations.insert(string_teams);
                            BenchmarkResult result;
                            result.difference = game_difference;
                            result.iteration = tries;
                            result.calculation_time = std::chrono::duration_cast<std::chrono::microseconds>(end_calculation - start_calculation).count();
                            results.push_back(result);
                            if (top_vector.size() > len_leaderboard) {
                                top_vector.pop();
                            }
                        }
                    }
                    tries++;
                }
            }
            top_vector = std::priority_queue<double>();
            performance_all_teams.push_back(results);
            results.clear();
        }
    }
    return BenchmarkResults_to_dict(performance_all_teams);
}

// random
std::vector<std::vector<py::dict>> random(
    const std::vector<std::vector<int>>& team_sizes,
    const std::vector<int>& amount_of_tries,
    const std::vector<std::vector<int>>& players_allocated_teams,
    const std::vector<double>& player_data,
    std::vector<int>& indexes_players_unallocated,
    int len_leaderboard,
    const std::vector<std::vector<double>>& player_to_player,
    bool interchangeable
    ){
    std::vector<std::vector<BenchmarkResult>> performance_all_teams;
    
    double (*difference_function)(std::vector<double>) = interchangeable? calculate_interchangeble_difference : calculate_difference;

    std::random_device rd;
    std::default_random_engine rng(rd());

    for (size_t i = 0; i < amount_of_tries.size(); ++i) {
        std::vector<int> current_teams_sizes = team_sizes[i];
        std::vector<std::vector<int>> teams;
        int tries = 0;
        std::sort(indexes_players_unallocated.begin(), indexes_players_unallocated.end());

        std::priority_queue<double> top_vector;
        std::unordered_set<std::string> existing_combinations;
        double game_difference;
        std::vector<double> game_scores;
        BenchmarkResult result;
        std::vector<BenchmarkResult> results;

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
                auto start_calculation = std::chrono::high_resolution_clock::now();
                std::tie(game_difference, game_scores) = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player, difference_function);
                auto end_calculation = std::chrono::high_resolution_clock::now();

                if (top_vector.size() < len_leaderboard || game_difference < top_vector.top()) {
                    std::string string_teams = serialize(teams);
                    if (!isduplicate(string_teams, existing_combinations)){
                        top_vector.push(game_difference);
                        existing_combinations.insert(string_teams);
                        BenchmarkResult result;
                        result.difference = game_difference;
                        result.iteration = tries;
                        result.calculation_time = std::chrono::duration_cast<std::chrono::microseconds>(end_calculation - start_calculation).count();
                        results.push_back(result);
                        if (top_vector.size() > len_leaderboard) {
                            top_vector.pop();
                        }
                    }
                }
                tries++;
            } while (tries < amount_of_tries[i]);
            top_vector = std::priority_queue<double>();
            performance_all_teams.push_back(results);
            results.clear();
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
                    auto start_calculation = std::chrono::high_resolution_clock::now();
                    std::tie(game_difference, game_scores) = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player, difference_function);
                    auto end_calculation = std::chrono::high_resolution_clock::now();

                    if (top_vector.size() < len_leaderboard || game_difference < top_vector.top()) {
                        std::string string_teams = serialize(teams);
                        if (!isduplicate(string_teams, existing_combinations)){
                            top_vector.push(game_difference);
                            existing_combinations.insert(string_teams);
                            BenchmarkResult result;
                            result.difference = game_difference;
                            result.iteration = tries;
                            result.calculation_time = std::chrono::duration_cast<std::chrono::microseconds>(end_calculation - start_calculation).count();
                            results.push_back(result);
                            if (top_vector.size() > len_leaderboard) {
                                top_vector.pop();
                            }
                        }
                    }
                    tries++;
                }
            }
            top_vector = std::priority_queue<double>();
            performance_all_teams.push_back(results);
            results.clear();
        }
    }
    return BenchmarkResults_to_dict(performance_all_teams);
}

PYBIND11_MODULE(benchmark_algorithms, m) {
    m.doc() = "A script to benchmark the algorithm, returning improved differences found, at which iteration it was found and the time it took to calculate the difference.";

    m.def("brute_force", &brute_force, "Benchmark the brute force algorithm.",
        py::arg("team_sizes"),
        py::arg("amount_of_tries"),
        py::arg("players_allocated_teams"),
        py::arg("player_data"),
        py::arg("indexes_players_unallocated"),
        py::arg("len_leaderboard"),
        py::arg("player_to_player"),
        py::arg("interchangeable")
    );

    m.def("random", &random, "Benchmark the random algorithm.",
        py::arg("team_sizes"),
        py::arg("amount_of_tries"),
        py::arg("players_allocated_teams"),
        py::arg("player_data"),
        py::arg("indexes_players_unallocated"),
        py::arg("len_leaderboard"),
        py::arg("player_to_player"),
        py::arg("interchangeable")
    );
}