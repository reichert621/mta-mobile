
def add(x, y):
    "Add two numbers"
    return x + y

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
