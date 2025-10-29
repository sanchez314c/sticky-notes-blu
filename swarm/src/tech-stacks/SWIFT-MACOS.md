## Swift macOS Tech Stack Guide
### Native macOS App Development with Swift & SwiftUI

*Created: September 2024*  
*Purpose: Comprehensive Swift macOS development guide with cliff notes*

---

## 🎯 Tech Stack Overview

### **Core Technologies**
- **Swift 5.9+** - Modern, safe systems programming language
- **SwiftUI 5.0+** - Declarative UI framework (primary)
- **AppKit** - Traditional macOS UI framework (when needed)
- **Xcode 15+** - Integrated development environment
- **Swift Package Manager** - Dependency management

### **macOS Frameworks**
- **Foundation** - Core data structures and utilities
- **Cocoa** - macOS-specific APIs and patterns
- **Core Data** - Object graph and persistence framework
- **CloudKit** - Apple's cloud database service
- **UserNotifications** - Local and push notifications
- **EventKit** - Calendar and reminders integration

---

## 📚 Swift Language Cliff Notes

### **Swift Fundamentals**

#### **Variables, Constants & Types**
```swift
// Constants and Variables
let appName = "My macOS App"         // Immutable
var userCount = 0                    // Mutable

// Type Annotations
let version: String = "1.0.0"
let buildNumber: Int = 42
let isDebugMode: Bool = false

// Optionals
var username: String? = nil          // Optional String
let email: String? = user.email      // Safe unwrapping needed

// Optional Binding
if let name = username {
    print("Hello, \(name)")
} else {
    print("No username provided")
}

// Nil Coalescing
let displayName = username ?? "Guest"

// Force Unwrapping (use carefully!)
let guaranteedValue = optionalValue!
```

#### **Collections**
```swift
// Arrays
var fruits = ["apple", "banana", "orange"]
fruits.append("grape")
fruits.insert("mango", at: 0)
let firstFruit = fruits.first        // Optional

// Dictionaries
var userInfo: [String: Any] = [
    "name": "John Doe",
    "age": 30,
    "isActive": true
]
userInfo["email"] = "john@example.com"

// Sets
var uniqueIDs: Set<String> = ["id1", "id2", "id3"]
uniqueIDs.insert("id4")
let hasID = uniqueIDs.contains("id1")
```

#### **Functions & Closures**
```swift
// Functions
func calculateArea(width: Double, height: Double) -> Double {
    return width * height
}

// Function with default parameters
func greetUser(name: String, greeting: String = "Hello") -> String {
    return "\(greeting), \(name)!"
}

// Higher-order functions
let numbers = [1, 2, 3, 4, 5]
let doubled = numbers.map { $0 * 2 }
let evens = numbers.filter { $0 % 2 == 0 }
let sum = numbers.reduce(0, +)

// Closures
let sortedNames = names.sorted { $0.localizedCaseInsensitiveCompare($1) == .orderedAscending }

// Trailing closure syntax
UIView.animate(withDuration: 0.3) {
    view.alpha = 0.5
}
```

#### **Classes & Structs**
```swift
// Struct (Value Type)
struct User {
    let id: UUID
    var name: String
    var email: String
    var isActive: Bool = true
    
    // Computed property
    var displayName: String {
        return name.isEmpty ? "Anonymous" : name
    }
    
    // Methods
    mutating func activate() {
        isActive = true
    }
}

// Class (Reference Type)
class UserManager: ObservableObject {
    @Published var currentUser: User?
    @Published var users: [User] = []
    
    private let networkService = NetworkService()
    
    func loadUsers() async {
        do {
            users = try await networkService.fetchUsers()
        } catch {
            print("Failed to load users: \(error)")
        }
    }
    
    func createUser(name: String, email: String) -> User {
        let user = User(id: UUID(), name: name, email: email)
        users.append(user)
        return user
    }
}
```

### **Error Handling**
```swift
// Define custom errors
enum NetworkError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingFailed
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL provided"
        case .noData:
            return "No data received"
        case .decodingFailed:
            return "Failed to decode response"
        }
    }
}

// Throwing functions
func fetchData(from urlString: String) async throws -> Data {
    guard let url = URL(string: urlString) else {
        throw NetworkError.invalidURL
    }
    
    let (data, _) = try await URLSession.shared.data(from: url)
    
    guard !data.isEmpty else {
        throw NetworkError.noData
    }
    
    return data
}

// Error handling with do-catch
func loadUserData() async {
    do {
        let data = try await fetchData(from: "https://api.example.com/users")
        let users = try JSONDecoder().decode([User].self, from: data)
        await MainActor.run {
            self.users = users
        }
    } catch NetworkError.invalidURL {
        print("Invalid URL error")
    } catch NetworkError.noData {
        print("No data error")
    } catch {
        print("Unexpected error: \(error)")
    }
}
```

---

## 🖼️ SwiftUI Essentials Cliff Notes

### **Basic Views & Modifiers**
```swift
import SwiftUI

struct ContentView: View {
    @State private var name = ""
    @State private var isPresented = false
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Text
                Text("Welcome to macOS")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                // TextField
                TextField("Enter your name", text: $name)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .frame(maxWidth: 300)
                
                // Button
                Button("Show Alert") {
                    isPresented = true
                }
                .buttonStyle(.borderedProminent)
                .alert("Hello", isPresented: $isPresented) {
                    Button("OK") { }
                } message: {
                    Text("Hello, \(name.isEmpty ? "World" : name)!")
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("My App")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button("Settings") {
                        // Open settings
                    }
                }
            }
        }
        .frame(minWidth: 600, minHeight: 400)
    }
}
```

### **Data Binding & State Management**
```swift
// ObservableObject for shared state
class AppViewModel: ObservableObject {
    @Published var items: [Item] = []
    @Published var isLoading = false
    @Published var searchText = ""
    
    // Computed property for filtered items
    var filteredItems: [Item] {
        if searchText.isEmpty {
            return items
        } else {
            return items.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
    }
    
    @MainActor
    func loadItems() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            // Simulate API call
            try await Task.sleep(for: .seconds(1))
            items = Item.sampleItems
        } catch {
            print("Failed to load items: \(error)")
        }
    }
}

// Using in SwiftUI
struct ItemListView: View {
    @StateObject private var viewModel = AppViewModel()
    
    var body: some View {
        NavigationView {
            VStack {
                SearchBar(text: $viewModel.searchText)
                
                if viewModel.isLoading {
                    ProgressView("Loading...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(viewModel.filteredItems) { item in
                        ItemRowView(item: item)
                    }
                }
            }
            .navigationTitle("Items")
            .task {
                await viewModel.loadItems()
            }
        }
    }
}
```

### **Custom Views & ViewModifiers**
```swift
// Custom View
struct SearchBar: View {
    @Binding var text: String
    
    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            
            TextField("Search...", text: $text)
                .textFieldStyle(PlainTextFieldStyle())
            
            if !text.isEmpty {
                Button("Clear") {
                    text = ""
                }
                .foregroundColor(.secondary)
            }
        }
        .padding(8)
        .background(Color(.controlBackgroundColor))
        .cornerRadius(8)
        .padding(.horizontal)
    }
}

// Custom ViewModifier
struct CardStyle: ViewModifier {
    let backgroundColor: Color
    let cornerRadius: CGFloat
    
    func body(content: Content) -> some View {
        content
            .padding()
            .background(backgroundColor)
            .cornerRadius(cornerRadius)
            .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

extension View {
    func cardStyle(backgroundColor: Color = Color(.controlBackgroundColor), cornerRadius: CGFloat = 8) -> some View {
        modifier(CardStyle(backgroundColor: backgroundColor, cornerRadius: cornerRadius))
    }
}

// Usage
Text("Card Content")
    .cardStyle()
```

---

## 🖥️ macOS-Specific Features

### **Menu Bar Integration**
```swift
// App.swift
@main
struct MyMacApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("New Document") {
                    // Handle new document
                }
                .keyboardShortcut("n")
            }
            
            CommandMenu("Tools") {
                Button("Export Data") {
                    // Handle export
                }
                .keyboardShortcut("e", modifiers: [.command, .shift])
                
                Divider()
                
                Button("Preferences") {
                    // Open preferences
                }
                .keyboardShortcut(",")
            }
        }
    }
}

// AppDelegate for additional macOS integration
class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // Configure app on launch
    }
    
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}
```

### **Preferences Window**
```swift
struct PreferencesView: View {
    @AppStorage("showMenuBarExtra") private var showMenuBarExtra = true
    @AppStorage("launchAtLogin") private var launchAtLogin = false
    @AppStorage("theme") private var theme = "system"
    
    var body: some View {
        TabView {
            GeneralPreferences()
                .tabItem {
                    Label("General", systemImage: "gear")
                }
            
            AppearancePreferences()
                .tabItem {
                    Label("Appearance", systemImage: "paintbrush")
                }
        }
        .frame(width: 500, height: 400)
    }
}

struct GeneralPreferences: View {
    @AppStorage("showMenuBarExtra") private var showMenuBarExtra = true
    @AppStorage("launchAtLogin") private var launchAtLogin = false
    
    var body: some View {
        Form {
            Section {
                Toggle("Show menu bar extra", isOn: $showMenuBarExtra)
                Toggle("Launch at login", isOn: $launchAtLogin)
                    .onChange(of: launchAtLogin) { _, newValue in
                        setLaunchAtLogin(enabled: newValue)
                    }
            }
        }
        .padding()
    }
    
    func setLaunchAtLogin(enabled: Bool) {
        let identifier = Bundle.main.bundleIdentifier!
        SMLoginItemSetEnabled(identifier as CFString, enabled)
    }
}
```

### **File System & Document Handling**
```swift
// Document-based app
struct Document: FileDocument {
    var text: String = ""
    
    static var readableContentTypes: [UTType] = [.plainText]
    
    init(text: String = "") {
        self.text = text
    }
    
    init(configuration: ReadConfiguration) throws {
        guard let data = configuration.file.regularFileContents,
              let string = String(data: data, encoding: .utf8)
        else {
            throw CocoaError(.fileReadCorruptFile)
        }
        text = string
    }
    
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        let data = text.data(using: .utf8)!
        return .init(regularFileWithContents: data)
    }
}

// File operations
class FileManager {
    static func saveToDesktop(content: String, fileName: String) {
        let desktop = FileManager.default.urls(for: .desktopDirectory, in: .userDomainMask).first!
        let fileURL = desktop.appendingPathComponent(fileName)
        
        do {
            try content.write(to: fileURL, atomically: true, encoding: .utf8)
            print("File saved to: \(fileURL)")
        } catch {
            print("Failed to save file: \(error)")
        }
    }
    
    static func openFileDialog() -> URL? {
        let openPanel = NSOpenPanel()
        openPanel.allowsMultipleSelection = false
        openPanel.canChooseDirectories = false
        openPanel.canChooseFiles = true
        openPanel.allowedContentTypes = [.text, .json]
        
        if openPanel.runModal() == .OK {
            return openPanel.urls.first
        }
        return nil
    }
}
```

---

## 🔄 Networking & Data Persistence

### **Modern Networking with async/await**
```swift
actor NetworkService {
    private let session = URLSession.shared
    
    func fetch<T: Codable>(_ type: T.Type, from urlString: String) async throws -> T {
        guard let url = URL(string: urlString) else {
            throw NetworkError.invalidURL
        }
        
        let (data, response) = try await session.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.invalidResponse
        }
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        
        return try decoder.decode(type, from: data)
    }
    
    func post<T: Codable>(_ object: T, to urlString: String) async throws {
        guard let url = URL(string: urlString) else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        request.httpBody = try encoder.encode(object)
        
        let (_, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.invalidResponse
        }
    }
}
```

### **Core Data Integration**
```swift
import CoreData

class CoreDataStack {
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "DataModel")
        container.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Core Data failed to load: \(error)")
            }
        }
        return container
    }()
    
    var viewContext: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    func save() {
        if viewContext.hasChanges {
            do {
                try viewContext.save()
            } catch {
                print("Save error: \(error)")
            }
        }
    }
}

// Using with SwiftUI
struct ContentView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(sortDescriptors: [NSSortDescriptor(keyPath: \Item.timestamp, ascending: true)])
    private var items: FetchedResults<Item>
    
    var body: some View {
        List {
            ForEach(items) { item in
                Text(item.name ?? "Unknown")
            }
            .onDelete(perform: deleteItems)
        }
        .toolbar {
            Button("Add Item") {
                addItem()
            }
        }
    }
    
    private func addItem() {
        let newItem = Item(context: viewContext)
        newItem.name = "New Item"
        newItem.timestamp = Date()
        
        do {
            try viewContext.save()
        } catch {
            print("Error saving: \(error)")
        }
    }
    
    private func deleteItems(offsets: IndexSet) {
        offsets.map { items[$0] }.forEach(viewContext.delete)
        
        do {
            try viewContext.save()
        } catch {
            print("Error deleting: \(error)")
        }
    }
}
```

---

## ⚡ AI Swarm Integration

### **Swift Code Analysis Swarm**
```bash
# SWIFT SYNTAX & STYLE AGENT
echo "SWIFT CODE ANALYSIS: Review this Swift code for syntax, style, and modern Swift best practices. Focus on: proper optionals usage, memory management, protocol conformance, naming conventions, Swift 5.9+ features.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
SWIFT CODE: [PASTE_SWIFT_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > swift_syntax_review.txt &

# SWIFTUI ARCHITECTURE AGENT  
echo "SWIFTUI ARCHITECTURE ANALYSIS: Evaluate this SwiftUI code for architecture, performance, and user experience. Focus on: view composition, state management, data flow, accessibility, macOS design guidelines.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
SWIFTUI CODE: [PASTE_SWIFTUI_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > swiftui_architecture_review.txt &

# MACOS INTEGRATION AGENT
echo "MACOS INTEGRATION REVIEW: Analyze this code for proper macOS integration and native behavior. Focus on: AppKit interop, menu bar integration, file system access, system services, performance optimization.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
MACOS CODE: [PASTE_MACOS_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > macos_integration_review.txt &

wait
```

### **Testing Strategy Swarm**
```bash
# SWIFT TESTING AGENT
echo "SWIFT TESTING STRATEGY: Design comprehensive testing approach for this Swift macOS code. Include: unit tests with XCTest, UI tests, performance tests, mock strategies, test data management.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
SWIFT CODE: [PASTE_SWIFT_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > swift_testing_strategy.txt &

# SWIFTUI TESTING AGENT
echo "SWIFTUI TESTING IMPLEMENTATION: Create SwiftUI-specific tests for this code. Include: view testing, interaction testing, accessibility testing, snapshot testing strategies.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
SWIFTUI CODE: [PASTE_SWIFTUI_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > swiftui_testing_implementation.txt &

wait
```

---

## 🧪 Testing & Debugging

### **XCTest Examples**
```swift
import XCTest
@testable import MyMacApp

class UserManagerTests: XCTestCase {
    var userManager: UserManager!
    
    override func setUp() {
        super.setUp()
        userManager = UserManager()
    }
    
    override func tearDown() {
        userManager = nil
        super.tearDown()
    }
    
    func testCreateUser() {
        // Given
        let name = "John Doe"
        let email = "john@example.com"
        
        // When
        let user = userManager.createUser(name: name, email: email)
        
        // Then
        XCTAssertEqual(user.name, name)
        XCTAssertEqual(user.email, email)
        XCTAssertTrue(user.isActive)
        XCTAssertEqual(userManager.users.count, 1)
    }
    
    func testAsyncNetworkCall() async throws {
        // Given
        let expectation = XCTestExpectation(description: "Network call completes")
        
        // When
        await userManager.loadUsers()
        
        // Then
        XCTAssertFalse(userManager.users.isEmpty)
        expectation.fulfill()
        
        await fulfillment(of: [expectation], timeout: 5.0)
    }
}
```

### **SwiftUI Testing**
```swift
import ViewInspector
@testable import MyMacApp

extension ContentView: Inspectable { }

class ContentViewTests: XCTestCase {
    func testButtonTap() throws {
        let sut = ContentView()
        
        // Find button and simulate tap
        try sut.inspect().find(button: "Show Alert").tap()
        
        // Verify state change
        XCTAssertTrue(try sut.inspect().find(ViewType.Alert.self).isPresented())
    }
    
    func testTextFieldBinding() throws {
        let sut = ContentView()
        let textField = try sut.inspect().find(ViewType.TextField.self)
        
        try textField.setInput("Test Input")
        
        // Verify binding updated
        XCTAssertEqual(try textField.input(), "Test Input")
    }
}
```

---

## 📦 Essential Dependencies

### **Swift Package Manager**
```swift
// Package.swift
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "MyMacApp",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "MyMacApp", targets: ["MyMacApp"])
    ],
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0"),
        .package(url: "https://github.com/nalexn/ViewInspector", from: "0.9.0"),
        .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.0.0")
    ],
    targets: [
        .executableTarget(
            name: "MyMacApp",
            dependencies: [
                "Alamofire"
            ]
        ),
        .testTarget(
            name: "MyMacAppTests",
            dependencies: ["MyMacApp", "ViewInspector"]
        )
    ]
)
```

---

## 🚀 Quick Commands

### **Xcode & Development**
```bash
# Create new macOS project
# File → New → Project → macOS → App

# Build and run
cmd + R

# Build for testing
cmd + shift + U

# Clean build folder
cmd + shift + K

# Archive for distribution
Product → Archive

# Command line tools
xcodebuild -project MyApp.xcodeproj -scheme MyApp -configuration Release
xcodebuild test -project MyApp.xcodeproj -scheme MyApp
```

### **Swift Package Manager**
```bash
# Create package
swift package init --type executable

# Build
swift build

# Run
swift run

# Test
swift test

# Update dependencies
swift package update

# Generate Xcode project
swift package generate-xcodeproj
```

---

## 🎨 macOS Design Guidelines

### **Visual Design**
- Use system colors and fonts when possible
- Follow 8pt grid system for layouts
- Implement proper dark mode support
- Use SF Symbols for icons
- Maintain consistent spacing and typography

### **Interaction Patterns**
```swift
// Keyboard shortcuts
.keyboardShortcut("n", modifiers: .command)

// Context menus
.contextMenu {
    Button("Copy") { /* action */ }
    Button("Delete") { /* action */ }
        .foregroundColor(.red)
}

// Hover effects
.onHover { isHovering in
    // Provide visual feedback
}
```

---

*This guide provides comprehensive Swift macOS development knowledge for building native macOS applications with AI swarm orchestration.*