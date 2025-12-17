//
//  FlunksWidgetBridge.swift
//  App
//
//  Capacitor Plugin to sync data from web app to iOS Widget via App Groups
//

import Foundation
import Capacitor

@objc(FlunksWidgetBridge)
public class FlunksWidgetBridge: CAPPlugin {
    
    // ⚠️ IMPORTANT: Must match App Group ID in your provisioning profile
    private let appGroupID = "group.net.flunks.app"
    
    /// Update widget data from JavaScript
    /// Call from JS: FlunksWidgetBridge.updateWidgetData({ gumBalance: 12450, ... })
    @objc func updateWidgetData(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            call.reject("Failed to access App Group UserDefaults")
            return
        }
        
        // Get values from JS
        let gumBalance = call.getInt("gumBalance") ?? 0
        let lockerNumber = call.getInt("lockerNumber") ?? 0
        let username = call.getString("username") ?? "Anon"
        let dailyClaimed = call.getBool("dailyClaimed") ?? false
        let nextClaimMinutes = call.getInt("nextClaimMinutes") ?? 0
        
        // Save to shared App Group storage
        defaults.set(gumBalance, forKey: "gumBalance")
        defaults.set(lockerNumber, forKey: "lockerNumber")
        defaults.set(username, forKey: "username")
        defaults.set(dailyClaimed, forKey: "dailyClaimed")
        defaults.set(nextClaimMinutes, forKey: "nextClaimMinutes")
        defaults.set(Date(), forKey: "lastUpdated")
        defaults.synchronize()
        
        // Trigger widget refresh
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        
        call.resolve([
            "success": true,
            "message": "Widget data updated"
        ])
    }
    
    /// Refresh all Flunks widgets
    @objc func refreshWidgets(_ call: CAPPluginCall) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
            call.resolve(["success": true])
        } else {
            call.reject("Widgets require iOS 14+")
        }
    }
    
    /// Get current widget data (for debugging)
    @objc func getWidgetData(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            call.reject("Failed to access App Group UserDefaults")
            return
        }
        
        call.resolve([
            "gumBalance": defaults.integer(forKey: "gumBalance"),
            "lockerNumber": defaults.integer(forKey: "lockerNumber"),
            "username": defaults.string(forKey: "username") ?? "Unknown",
            "dailyClaimed": defaults.bool(forKey: "dailyClaimed"),
            "nextClaimMinutes": defaults.integer(forKey: "nextClaimMinutes")
        ])
    }
    
    /// Clear all widget data (for logout)
    @objc func clearWidgetData(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            call.reject("Failed to access App Group UserDefaults")
            return
        }
        
        defaults.removeObject(forKey: "gumBalance")
        defaults.removeObject(forKey: "lockerNumber")
        defaults.removeObject(forKey: "username")
        defaults.removeObject(forKey: "dailyClaimed")
        defaults.removeObject(forKey: "nextClaimMinutes")
        defaults.removeObject(forKey: "lastUpdated")
        defaults.synchronize()
        
        // Refresh widgets to show empty state
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        
        call.resolve(["success": true])
    }
}

// Import for WidgetCenter
import WidgetKit
