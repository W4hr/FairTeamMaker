
from pybind11.setup_helpers import Pybind11Extension, build_ext
from setuptools import setup

__version__ = "0.0.1"

ext_modules = [
    Pybind11Extension(
        "benchmark_algorithms",
        ["benchmark_algorithms.cpp"],
        define_macros=[("VERSION_INFO", __version__)],
    ),
]

setup(
    name="benchmark_algorithm",
    version=__version__,
    author="Jakob Butze",
    author_email="jakobutze@proton.me",
    url="https://github.com/W4hr/FairTeamMaker",
    description="A script to benchmark the algorithm, returning improved differences found, at which iteration it was found and the time it took to calculate the difference.",
    ext_modules=ext_modules,
    cmdclass={"build_ext": build_ext},
    zip_safe=False,
    python_requires=">=3.7",
)