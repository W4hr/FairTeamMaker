#include <iostream>
#include <vector>
#include <map>
#include <algorithm>
#include <numeric>
#include <cstdlib>
#include <queue>
#include <utility>
#include <random>

#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

namespace py = pybind11;

using game_score_combo = std::pair<double, std::vector<std::vector<int>>>;

struct compare {
    bool operator()(const game_score_combo& a, const game_score_combo& b) {
        return a.first < b.first;
    }
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
        has_next_combination = std::prev_permutation(bitmap.begin(), bitmap.end());

        return true;
    }

    private:
    std::vector<int> input;
    int combination_size;
    int n;
    std::vector<bool> bitmap;
    bool has_next_combination;
};

double calculate_score_difference(std::vector<std::vector<int>> game, std::vector<std::vector<int>> players_allocated_teams, std::vector<double> player_scores, std::vector<std::vector<double>> player_to_player) {
    std::vector<std::vector<int>> combined_teams;
    combined_teams.reserve(game.size());
    for (size_t i = 0; i < game.size(); ++i) {
        std::vector<int> team;
        team.reserve(game[i].size() + players_allocated_teams[i].size());
        team.insert(team.end(), game[i].begin(), game[i].end());
        team.insert(team.end(), players_allocated_teams[i].begin(), players_allocated_teams[i].end());
        combined_teams.emplace_back(std::move(team));
    };

    std::vector<double> team_scores;
    for (size_t t = 0; t < combined_teams.size(); ++t) {
        double team_score = 0;
        for (size_t p = 0; p < combined_teams[t].size(); ++p) {
            team_score += player_scores[combined_teams[t][p]];
        };
        team_scores.push_back(team_score);
    };

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

    return difference_scores;
};

// Brute Force Algorythm

std::vector<std::vector<game_score_combo>> brute_force(
    const std::vector<std::vector<int>>& team_sizes,
    const std::vector<int>& amount_of_tries,
    const std::vector<std::vector<int>>& players_allocated_teams,
    const std::vector<double>& player_data,
    std::vector<int>& indexes_players_unallocated,
    int len_leaderboard,
    const std::vector<std::vector<double>>& player_to_player,
    const std::map<int, int>& matches
) {
    std::vector<std::vector<game_score_combo>> best_games;

    for (size_t i = 0; i < amount_of_tries.size(); ++i) {
        std::vector<int> current_teams_sizes = team_sizes[i];
        std::vector<std::vector<int>> teams;
        int tries = 0;
        std::sort(indexes_players_unallocated.begin(), indexes_players_unallocated.end());

        std::priority_queue<game_score_combo, std::vector<game_score_combo>, compare> top_vector;
        std::vector<game_score_combo> best_games_each_size;
        int players_needed = std::accumulate(current_teams_sizes.begin(), current_teams_sizes.end(), 0);

        if (players_needed == indexes_players_unallocated.size()) {
            do {
                teams.clear();
                int start = 0;
                for (auto team_size = current_teams_sizes.begin(); team_size != current_teams_sizes.end(); ++team_size) {
                    std::vector<int> team(indexes_players_unallocated.begin() + start, indexes_players_unallocated.begin() + start + *team_size);
                    teams.push_back(team);
                    start += *team_size;
                };
                double game_difference = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player);

                if (top_vector.size() < len_leaderboard) {
                    top_vector.push({game_difference, teams});
                } else if (game_difference < top_vector.top().first) {
                    top_vector.pop();
                    top_vector.push({game_difference, teams});
                }
                tries++;
            } while (tries < amount_of_tries[i] && std::next_permutation(indexes_players_unallocated.begin(), indexes_players_unallocated.end()));
            while (!top_vector.empty()) {
                best_games_each_size.push_back(top_vector.top());
                top_vector.pop();
            }
            best_games.push_back(best_games_each_size);
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
                    double game_difference = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player);

                    if (top_vector.size() < len_leaderboard) {
                        top_vector.push({game_difference, teams});
                    } else if (game_difference < top_vector.top().first) {
                        top_vector.pop();
                        top_vector.push({game_difference, teams});
                    }
                    tries++;
                }
            }
            while (!top_vector.empty()) {
                best_games_each_size.push_back(top_vector.top());
                top_vector.pop();
            }
            best_games.push_back(best_games_each_size);
            best_games_each_size.clear();
        }
    };
    return best_games;
}

// random
std::vector<std::vector<game_score_combo>> random(
    const std::vector<std::vector<int>>& team_sizes,
    const std::vector<int>& amount_of_tries,
    const std::vector<std::vector<int>>& players_allocated_teams,
    const std::vector<double>& player_data,
    std::vector<int>& indexes_players_unallocated,
    int len_leaderboard,
    const std::vector<std::vector<double>>& player_to_player,
    const std::map<int, int>& matches
) {
    std::vector<std::vector<game_score_combo>> best_games;
    
    std::random_device rd;
    std::default_random_engine rng(rd());

    for (size_t i = 0; i < amount_of_tries.size(); ++i) {
        std::vector<int> current_teams_sizes = team_sizes[i];
        std::vector<std::vector<int>> teams;
        int tries = 0;
        std::sort(indexes_players_unallocated.begin(), indexes_players_unallocated.end());

        std::priority_queue<game_score_combo, std::vector<game_score_combo>, compare> top_vector;
        std::vector<game_score_combo> best_games_each_size;
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
                };
                double game_difference = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player);

                if (top_vector.size() < len_leaderboard) {
                    top_vector.push({game_difference, teams});
                } else if (game_difference < top_vector.top().first) {
                    top_vector.pop();
                    top_vector.push({game_difference, teams});
                }
                tries++;
            } while (tries < amount_of_tries[i]);
            while (!top_vector.empty()) {
                best_games_each_size.push_back(top_vector.top());
                top_vector.pop();
            }
            best_games.push_back(best_games_each_size);
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
                    double game_difference = calculate_score_difference(teams, players_allocated_teams, player_data, player_to_player);

                    if (top_vector.size() < len_leaderboard) {
                        top_vector.push({game_difference, teams});
                    } else if (game_difference < top_vector.top().first) {
                        top_vector.pop();
                        top_vector.push({game_difference, teams});
                    }
                    tries++;
                }
            }
            while (!top_vector.empty()) {
                best_games_each_size.push_back(top_vector.top());
                top_vector.pop();
            }
            best_games.push_back(best_games_each_size);
            best_games_each_size.clear();
        }
    };
    return best_games;
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
        py::arg("player_to_player"),
        py::arg("matches")
    );

    m.def("random", &random, "Generate possible games using random shuffling",
        py::arg("team_sizes"),
        py::arg("amount_of_tries"),
        py::arg("players_allocated_teams"),
        py::arg("player_data"),
        py::arg("indexes_players_unallocated"),
        py::arg("len_leaderboard"),
        py::arg("player_to_player"),
        py::arg("matches")
    );
}