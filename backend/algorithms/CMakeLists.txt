cmake_minimum_required(VERSION 3.4...3.18)
project(game_calculator)

set(CMAKE_CXX_STANDARD 11)

# Specify the path to pybind11
set(PYBIND11_DIR "C:/Users/jakob/Documents/Programming/Projects/FairTeamMaker/venv/Lib/site-packages/pybind11")

# Set the Python executable and libraries
set(PYTHON_EXECUTABLE "C:/Users/jakob/Documents/Programming/Projects/FairTeamMaker/venv/Scripts/python.exe")
set(PYTHON_INCLUDE_DIR "C:/Users/jakob/Documents/Programming/Projects/FairTeamMaker/venv/include")
set(PYTHON_LIBRARIES "C:/Users/jakob/Documents/Programming/Projects/FairTeamMaker/venv/Lib/site-packages")

find_package(Python REQUIRED COMPONENTS Interpreter Development)
find_package(pybind11 REQUIRED PATHS ${PYBIND11_DIR})

# Use the correct source file name
pybind11_add_module(game_calculator allocation_algorythms.cpp)
