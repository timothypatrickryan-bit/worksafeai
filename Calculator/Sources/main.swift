import Foundation

func add(_ a: Double, _ b: Double) -> Double {
    return a + b
}

func subtract(_ a: Double, _ b: Double) -> Double {
    return a - b
}

func multiply(_ a: Double, _ b: Double) -> Double {
    return a * b
}

func divide(_ a: Double, _ b: Double) -> Double? {
    guard b != 0 else { return nil }
    return a / b
}

func calculator() {
    print("=== Simple Calculator ===")
    print("Enter first number: ", terminator: "")
    
    guard let firstInput = readLine(), let first = Double(firstInput) else {
        print("Invalid input")
        return
    }
    
    print("Enter operation (+, -, *, /): ", terminator: "")
    guard let operation = readLine() else {
        print("Invalid input")
        return
    }
    
    print("Enter second number: ", terminator: "")
    guard let secondInput = readLine(), let second = Double(secondInput) else {
        print("Invalid input")
        return
    }
    
    let result: Double?
    
    switch operation {
    case "+":
        result = add(first, second)
    case "-":
        result = subtract(first, second)
    case "*":
        result = multiply(first, second)
    case "/":
        result = divide(first, second)
    default:
        print("Unknown operation")
        return
    }
    
    if let result = result {
        print("Result: \(first) \(operation) \(second) = \(result)")
    } else {
        print("Error: Division by zero")
    }
}

calculator()
