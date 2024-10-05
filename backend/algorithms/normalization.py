import math
from typing import List

def normalize_norm(lin_norm: List[int],
                   k: float
                   ) -> List[int]:
    return [(math.e**-x**2)*k for x in lin_norm]

def normalize_lin(value: int,
                  min_score:int,
                  max_score:int,
                  minimum_value:int,
                  maximum_value:int
                  ) -> float:
    return ((value-min_score)/(max_score-min_score))* (maximum_value-minimum_value) + minimum_value

def normalize_sig(value:int
                  ) -> float:
    return (1)/(1+math.e**-value)