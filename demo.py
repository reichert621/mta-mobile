from flask import Flask, request, jsonify

app = Flask(__name__)

def fibonacci(n):
    "generate first N fibonacci numbers"

    fib_sequence = [0, 1]
    while len(fib_sequence) < n:
        fib_sequence.append(fib_sequence[-1] + fib_sequence[-2])
    return fib_sequence[:n]

@app.route('/api/hello', methods=['GET'])
def hello():
    name = request.args.get('name', 'World')
    return jsonify({'message': f'Hello, {name}!'})

@app.route('/api/add', methods=['GET'])
def add():
    num1 = request.args.get('num1', type=float)
    num2 = request.args.get('num2', type=float)
    return jsonify({'result': num1 + num2})

@app.route('/api/subtract', methods=['GET'])
def subtract():
    num1 = request.args.get('num1', type=float)
    num2 = request.args.get('num2', type=float)
    return jsonify({'result': num1 - num2})

@app.route('/api/multiply', methods=['GET'])
def multiply():
    num1 = request.args.get('num1', type=float)
    num2 = request.args.get('num2', type=float)
    return jsonify({'result': num1 * num2})

@app.route('/api/divide', methods=['GET'])
def divide():
    num1 = request.args.get('num1', type=float)
    num2 = request.args.get('num2', type=float)
    if num2 == 0:
        return jsonify({'error': 'Division by zero is not allowed'}), 400
    return jsonify({'result': num1 / num2})

if __name__ == '__main__':
    app.run(debug=True)
