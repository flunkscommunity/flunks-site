// swift-tools-version: 5.9
import PackageDescription

// Modified for Xcode Cloud compatibility - uses remote packages instead of local node_modules
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.0.1"),
        .package(url: "https://github.com/ionic-team/capacitor-plugins.git", exact: "8.0.0")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorApp", package: "capacitor-plugins"),
                .product(name: "CapacitorLocalNotifications", package: "capacitor-plugins")
            ]
        )
    ]
)
