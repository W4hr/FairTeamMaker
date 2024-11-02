
from pybind11.setup_helpers import Pybind11Extension, build_ext
from setuptools import setup

__version__ = "0.0.1"

ext_modules = [
    Pybind11Extension(
        "game_calculator",
        ["allocation_algorithms.cpp"],
        define_macros=[("VERSION_INFO", __version__)],
    ),
]

setup(
    name="game_calculator",
    version=__version__,
    author="Jakob Butze",
    author_email="jakobutze@proton.me",
    url="https://github.com/W4hr/FairTeamMaker",
    description="A cpp implementation of the brute force algorythm calculating the best player combinations.",
    ext_modules=ext_modules,
    cmdclass={"build_ext": build_ext},
    zip_safe=False,
    python_requires=">=3.7",
)