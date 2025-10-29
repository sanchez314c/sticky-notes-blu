## Swift iOS/iPadOS Tech Stack Guide
### Native iOS & iPadOS App Development with Swift & SwiftUI

*Created: September 2024*  
*Purpose: Comprehensive Swift iOS/iPadOS development guide with cliff notes*

---

## 🎯 Tech Stack Overview

### **Core Technologies**
- **Swift 5.9+** - Modern, safe systems programming language
- **SwiftUI 5.0+** - Declarative UI framework (primary)
- **UIKit** - Traditional iOS UI framework (when needed)
- **Xcode 15+** - Integrated development environment
- **Swift Package Manager** - Dependency management

### **iOS/iPadOS Frameworks**
- **Foundation** - Core data structures and utilities
- **UIKit** - UI components and view controllers
- **Core Data** - Object graph and persistence framework
- **CloudKit** - Apple's cloud database service
- **UserNotifications** - Local and push notifications
- **Core Location** - Location services
- **AVFoundation** - Audio/video processing
- **Core Animation** - Advanced animations

---

## 📱 iOS-Specific SwiftUI Patterns

### **Navigation & Screen Management**
```swift
import SwiftUI

// iOS 16+ Navigation Stack
struct ContentView: View {
    @State private var navigationPath = NavigationPath()
    
    var body: some View {
        NavigationStack(path: $navigationPath) {
            HomeView()
                .navigationDestination(for: User.self) { user in
                    UserDetailView(user: user)
                }
                .navigationDestination(for: String.self) { route in
                    switch route {
                    case "settings":
                        SettingsView()
                    case "profile":
                        ProfileView()
                    default:
                        Text("Unknown route")
                    }
                }
        }
    }
}

// Tab-based navigation
struct MainTabView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house")
                }
                .tag(0)
            
            SearchView()
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
                .tag(1)
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
                .tag(2)
        }
        .accentColor(.blue)
    }
}
```

### **List & Collection Views**
```swift
// Modern List with sections
struct ItemListView: View {
    @StateObject private var viewModel = ItemListViewModel()
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.sections, id: \.title) { section in
                    Section(header: Text(section.title)) {
                        ForEach(section.items) { item in
                            NavigationLink(destination: ItemDetailView(item: item)) {
                                ItemRowView(item: item)
                            }
                        }
                        .onDelete { indexSet in
                            viewModel.deleteItems(from: section, at: indexSet)
                        }
                    }
                }
            }
            .navigationTitle("Items")
            .searchable(text: $searchText, placement: .navigationBarDrawer(displayMode: .always))
            .refreshable {
                await viewModel.refresh()
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        viewModel.addNewItem()
                    }
                }
            }
        }
        .onChange(of: searchText) { _, newValue in
            viewModel.filterItems(searchText: newValue)
        }
        .task {
            await viewModel.loadItems()
        }
    }
}

// Custom row view with swipe actions
struct ItemRowView: View {
    let item: Item
    @State private var isFavorited = false
    
    var body: some View {
        HStack {
            AsyncImage(url: item.imageURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
            }
            .frame(width: 60, height: 60)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.headline)
                    .lineLimit(1)
                
                Text(item.subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }
            
            Spacer()
            
            Button(action: toggleFavorite) {
                Image(systemName: isFavorited ? "heart.fill" : "heart")
                    .foregroundColor(isFavorited ? .red : .gray)
            }
        }
        .swipeActions(edge: .trailing) {
            Button("Delete") {
                // Delete action
            }
            .tint(.red)
            
            Button("Archive") {
                // Archive action
            }
            .tint(.blue)
        }
        .swipeActions(edge: .leading) {
            Button("Pin") {
                // Pin action
            }
            .tint(.yellow)
        }
    }
    
    private func toggleFavorite() {
        withAnimation(.spring()) {
            isFavorited.toggle()
        }
    }
}
```

### **Form & Input Handling**
```swift
struct UserProfileForm: View {
    @StateObject private var viewModel = UserProfileViewModel()
    @FocusState private var focusedField: Field?
    
    enum Field: CaseIterable {
        case firstName, lastName, email, phone
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section("Personal Information") {
                    TextField("First Name", text: $viewModel.firstName)
                        .focused($focusedField, equals: .firstName)
                        .textContentType(.givenName)
                        .autocorrectionDisabled()
                    
                    TextField("Last Name", text: $viewModel.lastName)
                        .focused($focusedField, equals: .lastName)
                        .textContentType(.familyName)
                        .autocorrectionDisabled()
                    
                    TextField("Email", text: $viewModel.email)
                        .focused($focusedField, equals: .email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                    
                    TextField("Phone", text: $viewModel.phone)
                        .focused($focusedField, equals: .phone)
                        .textContentType(.telephoneNumber)
                        .keyboardType(.phonePad)
                }
                
                Section("Preferences") {
                    Toggle("Enable Notifications", isOn: $viewModel.notificationsEnabled)
                    
                    Picker("Theme", selection: $viewModel.selectedTheme) {
                        Text("Light").tag("light")
                        Text("Dark").tag("dark")
                        Text("System").tag("system")
                    }
                    .pickerStyle(.segmented)
                }
                
                Section {
                    Button("Save Changes") {
                        Task {
                            await viewModel.saveProfile()
                        }
                    }
                    .disabled(!viewModel.isValid)
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    
                    Button("Done") {
                        focusedField = nil
                    }
                }
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK") { }
            } message: {
                Text(viewModel.errorMessage)
            }
        }
    }
}
```

---

## 📲 iPad-Specific Adaptations

### **Adaptive Layouts**
```swift
struct AdaptiveContentView: View {
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @Environment(\.verticalSizeClass) private var verticalSizeClass
    
    var body: some View {
        Group {
            if horizontalSizeClass == .regular && verticalSizeClass == .regular {
                // iPad layout
                NavigationSplitView {
                    SidebarView()
                } content: {
                    ContentListView()
                } detail: {
                    DetailView()
                }
            } else {
                // iPhone layout
                NavigationStack {
                    ContentListView()
                }
            }
        }
    }
}

// Split view for iPad
struct iPadContentView: View {
    @State private var selectedItem: Item?
    @State private var columnVisibility = NavigationSplitViewVisibility.doubleColumn
    
    var body: some View {
        NavigationSplitView(columnVisibility: $columnVisibility) {
            // Sidebar
            List(selection: $selectedItem) {
                ForEach(items) { item in
                    NavigationLink(value: item) {
                        ItemRowView(item: item)
                    }
                }
            }
            .navigationTitle("Items")
            .navigationSplitViewColumnWidth(min: 250, ideal: 300, max: 400)
        } detail: {
            // Detail
            if let selectedItem = selectedItem {
                ItemDetailView(item: selectedItem)
            } else {
                ContentUnavailableView(
                    "Select an Item",
                    systemImage: "sidebar.left",
                    description: Text("Choose an item from the sidebar to view details")
                )
            }
        }
    }
}
```

### **Multi-Window Support (iPadOS)**
```swift
@main
struct MyiPadApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .commands {
            CommandMenu("Window") {
                Button("New Window") {
                    openNewWindow()
                }
                .keyboardShortcut("n", modifiers: [.command, .option])
            }
        }
        
        // Additional window scenes
        WindowGroup("Detail", id: "detail") {
            DetailWindowView()
        }
        .handlesExternalEvents(matching: Set(arrayLiteral: "detail"))
    }
    
    private func openNewWindow() {
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
            let activity = NSUserActivity(activityType: "new-window")
            UIApplication.shared.requestSceneSessionActivation(nil, userActivity: activity, options: nil)
        }
    }
}
```

---

## 📍 iOS Frameworks Integration

### **Core Location**
```swift
import CoreLocation

class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    
    @Published var location: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var locationError: Error?
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
    }
    
    func requestPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func startLocationUpdates() {
        guard authorizationStatus == .authorizedWhenInUse || authorizationStatus == .authorizedAlways else {
            return
        }
        locationManager.startUpdatingLocation()
    }
    
    func stopLocationUpdates() {
        locationManager.stopUpdatingLocation()
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        location = locations.first
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        locationError = error
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus
    }
}

// Usage in SwiftUI
struct LocationView: View {
    @StateObject private var locationManager = LocationManager()
    
    var body: some View {
        VStack {
            if let location = locationManager.location {
                Text("Lat: \(location.coordinate.latitude)")
                Text("Lng: \(location.coordinate.longitude)")
            } else {
                Text("Location not available")
            }
            
            Button("Request Location") {
                locationManager.requestPermission()
                locationManager.startLocationUpdates()
            }
        }
        .onAppear {
            locationManager.requestPermission()
        }
    }
}
```

### **Local Notifications**
```swift
import UserNotifications

class NotificationManager: ObservableObject {
    @Published var hasPermission = false
    
    init() {
        checkPermission()
    }
    
    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
            DispatchQueue.main.async {
                self.hasPermission = granted
            }
        }
    }
    
    private func checkPermission() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.hasPermission = settings.authorizationStatus == .authorized
            }
        }
    }
    
    func scheduleNotification(title: String, body: String, delay: TimeInterval) {
        guard hasPermission else { return }
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        content.badge = 1
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Notification error: \(error)")
            }
        }
    }
    
    func scheduleDailyReminder(hour: Int, minute: Int) {
        let content = UNMutableNotificationContent()
        content.title = "Daily Reminder"
        content.body = "Don't forget to check your tasks!"
        content.sound = .default
        
        var dateComponents = DateComponents()
        dateComponents.hour = hour
        dateComponents.minute = minute
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        let request = UNNotificationRequest(identifier: "daily-reminder", content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
}
```

### **Camera & Photo Library**
```swift
import PhotosUI

struct PhotoPickerView: View {
    @State private var selectedPhotos: [PhotosPickerItem] = []
    @State private var selectedImages: [UIImage] = []
    @State private var showCamera = false
    @State private var capturedImage: UIImage?
    
    var body: some View {
        VStack {
            ScrollView(.horizontal) {
                LazyHStack {
                    ForEach(Array(selectedImages.enumerated()), id: \.offset) { index, image in
                        Image(uiImage: image)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 100, height: 100)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
            }
            .frame(height: 120)
            
            HStack {
                PhotosPicker("Select Photos", selection: $selectedPhotos, maxSelectionCount: 5, matching: .images)
                    .buttonStyle(.bordered)
                
                Button("Take Photo") {
                    showCamera = true
                }
                .buttonStyle(.bordered)
            }
        }
        .onChange(of: selectedPhotos) { _, newValue in
            Task {
                selectedImages = []
                for photo in newValue {
                    if let data = try? await photo.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        selectedImages.append(image)
                    }
                }
            }
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraView { image in
                capturedImage = image
                selectedImages.append(image)
            }
        }
    }
}

struct CameraView: UIViewControllerRepresentable {
    let onImageCaptured: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraView
        
        init(_ parent: CameraView) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.onImageCaptured(image)
            }
            parent.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}
```

---

## ⚡ AI Swarm Integration

### **iOS/iPadOS Development Swarm**
```bash
# IOS ARCHITECTURE AGENT
echo "IOS ARCHITECTURE ANALYSIS: Review this iOS/iPadOS SwiftUI code for platform-specific best practices. Focus on: navigation patterns, adaptive layouts, size classes, lifecycle management, performance optimization.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
IOS CODE: [PASTE_IOS_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > ios_architecture_review.txt &

# IOS UX/UI AGENT  
echo "IOS USER EXPERIENCE REVIEW: Analyze this iOS interface for Human Interface Guidelines compliance. Focus on: touch targets, accessibility, dark mode support, typography, spacing, animation patterns.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
UI CODE: [PASTE_UI_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > ios_ux_review.txt &

# IOS PERFORMANCE AGENT
echo "IOS PERFORMANCE OPTIMIZATION: Evaluate this iOS code for performance and memory usage. Focus on: view hierarchy optimization, image handling, Core Data efficiency, background processing, battery usage.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
PERFORMANCE CODE: [PASTE_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > ios_performance_review.txt &

wait
```

### **iOS Testing Strategy Swarm**
```bash
# IOS TESTING AGENT
echo "IOS TESTING STRATEGY: Design comprehensive testing approach for this iOS app. Include: unit tests, UI tests, snapshot tests, accessibility tests, device-specific testing strategies.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
IOS CODE: [PASTE_IOS_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > ios_testing_strategy.txt &

# IOS ACCESSIBILITY AGENT
echo "IOS ACCESSIBILITY REVIEW: Analyze this iOS interface for accessibility compliance. Focus on: VoiceOver support, Dynamic Type, color contrast, focus management, alternative input methods.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
ACCESSIBILITY CODE: [PASTE_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > ios_accessibility_review.txt &

wait
```

---

## 🧪 Testing for iOS

### **XCTest for iOS**
```swift
import XCTest
@testable import MyiOSApp

class ViewModelTests: XCTestCase {
    var viewModel: ItemListViewModel!
    
    override func setUp() {
        super.setUp()
        viewModel = ItemListViewModel()
    }
    
    func testLoadItems() async {
        // Given
        XCTAssertTrue(viewModel.items.isEmpty)
        
        // When
        await viewModel.loadItems()
        
        // Then
        XCTAssertFalse(viewModel.items.isEmpty)
        XCTAssertFalse(viewModel.isLoading)
    }
    
    func testFilterItems() {
        // Given
        viewModel.items = Item.sampleItems
        
        // When
        viewModel.filterItems(searchText: "test")
        
        // Then
        let filteredCount = viewModel.filteredItems.count
        XCTAssertLessThanOrEqual(filteredCount, viewModel.items.count)
    }
}
```

### **UI Testing**
```swift
import XCTest

class MyiOSAppUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }
    
    func testNavigationFlow() {
        // Test basic navigation
        let homeButton = app.tabBars.buttons["Home"]
        XCTAssertTrue(homeButton.exists)
        homeButton.tap()
        
        // Test list interaction
        let firstCell = app.tables.cells.firstMatch
        XCTAssertTrue(firstCell.waitForExistence(timeout: 5))
        firstCell.tap()
        
        // Verify detail view
        let detailTitle = app.navigationBars.staticTexts["Detail"]
        XCTAssertTrue(detailTitle.waitForExistence(timeout: 3))
    }
    
    func testAccessibility() {
        // Test VoiceOver accessibility
        app.accessibilityActivate()
        
        let homeTab = app.tabBars.buttons["Home"]
        XCTAssertNotNil(homeTab.accessibilityLabel)
        XCTAssertNotNil(homeTab.accessibilityHint)
    }
}
```

---

## 🚀 Quick Commands

### **iOS Development Workflow**
```bash
# Create new iOS project
# File → New → Project → iOS → App

# Build and run on simulator
cmd + R

# Build and run on device
Select device and cmd + R

# Run tests
cmd + U

# Build for App Store
Product → Archive

# Command line builds
xcodebuild -project MyApp.xcodeproj -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15 Pro' build
xcodebuild test -project MyApp.xcodeproj -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

### **iOS Simulators**
```bash
# List available simulators
xcrun simctl list devices

# Boot simulator
xcrun simctl boot "iPhone 15 Pro"

# Install app on simulator
xcrun simctl install booted MyApp.app

# Launch app
xcrun simctl launch booted com.company.MyApp
```

---

## 📱 iOS Design Guidelines

### **Human Interface Guidelines**
- Use 44pt minimum touch targets
- Implement proper navigation hierarchies
- Support both light and dark modes
- Use system fonts and colors when possible
- Provide haptic feedback for interactions
- Support Dynamic Type for accessibility

### **Common iOS Patterns**
```swift
// Pull to refresh
.refreshable {
    await viewModel.refresh()
}

// Haptic feedback
let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
impactFeedback.impactOccurred()

// Safe area handling
.safeAreaInset(edge: .bottom) {
    // Custom content that respects safe area
}

// Context menus
.contextMenu {
    Button("Share") { /* action */ }
    Button("Edit") { /* action */ }
    Button("Delete") { /* action */ }
        .foregroundColor(.red)
}
```

---

*This guide provides comprehensive Swift iOS/iPadOS development knowledge for building native mobile applications with AI swarm orchestration.*