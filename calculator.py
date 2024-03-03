
import math

def add(numbers):
    "Add a list of numbers"
    return sum(numbers)

def power(x, y):
    "Calculate the power of a number"
    return math.pow(x, y)

def sqrt(x):
    "Calculate the square root of a number"
    return math.sqrt(x)

def subtract(x, y):
    "Subtract two numbers"
    return x - y

def multiply(x, y):
    "Multiply two numbers"
    return x * y

def divide(x, y):
    "Divide two numbers, return error if divisor is zero"
    if y == 0:
        return 'Error: Division by zero'
    else:
        return x / y

def factorial(x):
    "Calculate the factorial of a number"
    return math.factorial(x)

def sin(x):
    "Calculate the sine of a number"
    return math.sin(x)

def cos(x):
    "Calculate the cosine of a number"
    return math.cos(x)

def tan(x):
    "Calculate the tangent of a number"
    return math.tan(x)

def abs_val(x):
    "Calculate the absolute value of a number"
    return abs(x)
