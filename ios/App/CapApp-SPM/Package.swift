// swift-tools-version: 5.9
import PackageDescription

// IMPORTANT: This file is configured for Xcode Cloud compatibility.
// It uses remote GitHub packages instead of local node_modules paths.
// Local development uses `npx cap sync` which may overwrite this, 
// but the git version should always use remote URLs.

let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.0.1")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ]
        )
    ]
)
