//
//  FlunksWidget.swift
//  FlunksWidget
//
//  Flunks GUM Balance Widget - Home Screen & Lock Screen
//

import WidgetKit
import SwiftUI

// MARK: - Data Model

struct FlunksWidgetData {
    let gumBalance: Int
    let lockerNumber: Int
    let username: String
    let dailyClaimed: Bool
    let nextClaimMinutes: Int
    let lastUpdated: Date
    
    static let placeholder = FlunksWidgetData(
        gumBalance: 12450,
        lockerNumber: 1337,
        username: "FlunkStudent",
        dailyClaimed: false,
        nextClaimMinutes: 0,
        lastUpdated: Date()
    )
    
    static let empty = FlunksWidgetData(
        gumBalance: 0,
        lockerNumber: 0,
        username: "Connect Wallet",
        dailyClaimed: false,
        nextClaimMinutes: 0,
        lastUpdated: Date()
    )
}

// MARK: - Timeline Provider

struct FlunksWidgetProvider: TimelineProvider {
    
    // App Group ID - must match your Capacitor config
    let appGroupID = "group.net.flunks.app"
    
    func placeholder(in context: Context) -> FlunksWidgetEntry {
        FlunksWidgetEntry(date: Date(), data: .placeholder)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (FlunksWidgetEntry) -> Void) {
        let data = loadWidgetData()
        completion(FlunksWidgetEntry(date: Date(), data: data))
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<FlunksWidgetEntry>) -> Void) {
        let data = loadWidgetData()
        let entry = FlunksWidgetEntry(date: Date(), data: data)
        
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        
        completion(timeline)
    }
    
    private func loadWidgetData() -> FlunksWidgetData {
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            return .empty
        }
        
        let gumBalance = defaults.integer(forKey: "gumBalance")
        let lockerNumber = defaults.integer(forKey: "lockerNumber")
        let username = defaults.string(forKey: "username") ?? "Anon"
        let dailyClaimed = defaults.bool(forKey: "dailyClaimed")
        let nextClaimMinutes = defaults.integer(forKey: "nextClaimMinutes")
        let lastUpdated = defaults.object(forKey: "lastUpdated") as? Date ?? Date()
        
        // If no data saved yet, return empty state
        if gumBalance == 0 && lockerNumber == 0 {
            return .empty
        }
        
        return FlunksWidgetData(
            gumBalance: gumBalance,
            lockerNumber: lockerNumber,
            username: username,
            dailyClaimed: dailyClaimed,
            nextClaimMinutes: nextClaimMinutes,
            lastUpdated: lastUpdated
        )
    }
}

// MARK: - Timeline Entry

struct FlunksWidgetEntry: TimelineEntry {
    let date: Date
    let data: FlunksWidgetData
}

// MARK: - Brand Colors

struct FlunksColors {
    // 🎨 CUSTOMIZE THESE TO MATCH YOUR BRAND!
    static let primary = Color(hex: "#FFD700")      // Gold/Yellow
    static let secondary = Color(hex: "#8B5CF6")    // Purple
    static let accent = Color(hex: "#10B981")       // Green (for success)
    static let warning = Color(hex: "#F59E0B")      // Orange
    static let backgroundDark = Color(hex: "#0f0f1a")
    static let backgroundMid = Color(hex: "#1a1a2e")
    static let textPrimary = Color.white
    static let textSecondary = Color.gray
}

// MARK: - Widget Views

// ═══════════════════════════════════════════════════════════════
// SMALL WIDGET - Just the essentials
// ═══════════════════════════════════════════════════════════════

struct SmallWidgetView: View {
    let data: FlunksWidgetData
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [FlunksColors.backgroundMid, FlunksColors.backgroundDark],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(spacing: 6) {
                // GUM Icon
                Text("🍬")
                    .font(.system(size: 28))
                
                // Balance
                Text(formatBalance(data.gumBalance))
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(FlunksColors.textPrimary)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                
                Text("GUM")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(FlunksColors.primary)
                
                // Daily status indicator
                HStack(spacing: 4) {
                    Circle()
                        .fill(data.dailyClaimed ? FlunksColors.accent : FlunksColors.warning)
                        .frame(width: 6, height: 6)
                    Text(data.dailyClaimed ? "Claimed" : "Claim!")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(data.dailyClaimed ? FlunksColors.accent : FlunksColors.warning)
                }
            }
            .padding()
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// MEDIUM WIDGET - Balance + Locker + Daily Status
// ═══════════════════════════════════════════════════════════════

struct MediumWidgetView: View {
    let data: FlunksWidgetData
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [FlunksColors.backgroundMid, FlunksColors.backgroundDark],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            HStack(spacing: 16) {
                // Left side - GUM Balance
                VStack(spacing: 4) {
                    Text("🍬")
                        .font(.system(size: 32))
                    
                    Text(formatBalance(data.gumBalance))
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(FlunksColors.textPrimary)
                        .minimumScaleFactor(0.5)
                        .lineLimit(1)
                    
                    Text("GUM")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(FlunksColors.primary)
                }
                .frame(maxWidth: .infinity)
                
                // Divider
                Rectangle()
                    .fill(FlunksColors.primary.opacity(0.3))
                    .frame(width: 1)
                    .padding(.vertical, 12)
                
                // Right side - Status
                VStack(alignment: .leading, spacing: 8) {
                    // Locker
                    HStack(spacing: 6) {
                        Image(systemName: "lock.fill")
                            .font(.system(size: 12))
                            .foregroundColor(FlunksColors.secondary)
                        Text("Locker #\(data.lockerNumber)")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(FlunksColors.textPrimary)
                    }
                    
                    // Username
                    HStack(spacing: 6) {
                        Image(systemName: "person.fill")
                            .font(.system(size: 12))
                            .foregroundColor(FlunksColors.secondary)
                        Text(data.username)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(FlunksColors.textSecondary)
                            .lineLimit(1)
                    }
                    
                    Spacer()
                    
                    // Daily Status
                    HStack(spacing: 6) {
                        Image(systemName: data.dailyClaimed ? "checkmark.circle.fill" : "gift.fill")
                            .font(.system(size: 12))
                            .foregroundColor(data.dailyClaimed ? FlunksColors.accent : FlunksColors.warning)
                        
                        if data.dailyClaimed {
                            Text(formatTimeRemaining(data.nextClaimMinutes))
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(FlunksColors.textSecondary)
                        } else {
                            Text("Daily Ready!")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(FlunksColors.warning)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding()
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// LARGE WIDGET - Full Dashboard with Recent Activity
// ═══════════════════════════════════════════════════════════════

struct LargeWidgetView: View {
    let data: FlunksWidgetData
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [FlunksColors.backgroundMid, FlunksColors.backgroundDark],
                startPoint: .top,
                endPoint: .bottom
            )
            
            VStack(spacing: 12) {
                // Header
                HStack {
                    Text("🍬")
                        .font(.system(size: 24))
                    Text("FLUNKS")
                        .font(.system(size: 18, weight: .black, design: .rounded))
                        .foregroundColor(FlunksColors.primary)
                    Spacer()
                    Text("Locker #\(data.lockerNumber)")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(FlunksColors.textSecondary)
                }
                
                Divider()
                    .background(FlunksColors.primary.opacity(0.3))
                
                // Main Balance
                VStack(spacing: 4) {
                    Text("GUM BALANCE")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(FlunksColors.textSecondary)
                        .tracking(2)
                    
                    Text(formatBalance(data.gumBalance))
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundColor(FlunksColors.textPrimary)
                        .minimumScaleFactor(0.5)
                        .lineLimit(1)
                }
                
                // Status Cards
                HStack(spacing: 12) {
                    // Daily Check-in Card
                    StatusCard(
                        icon: data.dailyClaimed ? "checkmark.circle.fill" : "gift.fill",
                        title: "Daily",
                        value: data.dailyClaimed ? "Claimed ✓" : "Ready!",
                        color: data.dailyClaimed ? FlunksColors.accent : FlunksColors.warning
                    )
                    
                    // Next Claim Card
                    StatusCard(
                        icon: "clock.fill",
                        title: "Next Claim",
                        value: data.dailyClaimed ? formatTimeRemaining(data.nextClaimMinutes) : "Now!",
                        color: FlunksColors.secondary
                    )
                }
                
                Spacer()
                
                // Footer
                HStack {
                    Text("Updated \(formatLastUpdated(data.lastUpdated))")
                        .font(.system(size: 10))
                        .foregroundColor(FlunksColors.textSecondary.opacity(0.6))
                    Spacer()
                    Text("Tap to open")
                        .font(.system(size: 10))
                        .foregroundColor(FlunksColors.primary.opacity(0.6))
                }
            }
            .padding()
        }
    }
}

// MARK: - Helper Views

struct StatusCard: View {
    let icon: String
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(color)
            
            Text(title)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(FlunksColors.textSecondary)
            
            Text(value)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(FlunksColors.textPrimary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(FlunksColors.backgroundDark.opacity(0.5))
        .cornerRadius(12)
    }
}

// MARK: - Lock Screen Widgets (iOS 16+)

struct LockScreenCircularView: View {
    let data: FlunksWidgetData
    
    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 2) {
                Text("🍬")
                    .font(.system(size: 14))
                Text(formatBalanceShort(data.gumBalance))
                    .font(.system(size: 12, weight: .bold))
            }
        }
    }
}

struct LockScreenRectangularView: View {
    let data: FlunksWidgetData
    
    var body: some View {
        HStack {
            Text("🍬")
                .font(.system(size: 20))
            VStack(alignment: .leading, spacing: 2) {
                Text(formatBalance(data.gumBalance) + " GUM")
                    .font(.system(size: 14, weight: .bold))
                Text(data.dailyClaimed ? "Daily ✓" : "Daily Ready!")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
            Spacer()
        }
    }
}

struct LockScreenInlineView: View {
    let data: FlunksWidgetData
    
    var body: some View {
        HStack(spacing: 4) {
            Text("🍬")
            Text("\(formatBalanceShort(data.gumBalance)) GUM")
                .font(.system(size: 12, weight: .semibold))
        }
    }
}

// MARK: - Helper Functions

func formatBalance(_ balance: Int) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .decimal
    return formatter.string(from: NSNumber(value: balance)) ?? "\(balance)"
}

func formatBalanceShort(_ balance: Int) -> String {
    if balance >= 1000000 {
        return String(format: "%.1fM", Double(balance) / 1000000)
    } else if balance >= 1000 {
        return String(format: "%.1fK", Double(balance) / 1000)
    }
    return "\(balance)"
}

func formatTimeRemaining(_ minutes: Int) -> String {
    if minutes <= 0 { return "Now!" }
    let hours = minutes / 60
    let mins = minutes % 60
    if hours > 0 {
        return "\(hours)h \(mins)m"
    }
    return "\(mins)m"
}

func formatLastUpdated(_ date: Date) -> String {
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .abbreviated
    return formatter.localizedString(for: date, relativeTo: Date())
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Widget Configuration

struct FlunksWidget: Widget {
    let kind: String = "FlunksWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FlunksWidgetProvider()) { entry in
            FlunksWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Flunks GUM")
        .description("Track your GUM balance and daily check-in status")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

struct FlunksWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: FlunksWidgetEntry
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(data: entry.data)
        case .systemMedium:
            MediumWidgetView(data: entry.data)
        case .systemLarge:
            LargeWidgetView(data: entry.data)
        case .accessoryCircular:
            LockScreenCircularView(data: entry.data)
        case .accessoryRectangular:
            LockScreenRectangularView(data: entry.data)
        case .accessoryInline:
            LockScreenInlineView(data: entry.data)
        default:
            SmallWidgetView(data: entry.data)
        }
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    FlunksWidget()
} timeline: {
    FlunksWidgetEntry(date: .now, data: .placeholder)
}

#Preview(as: .systemMedium) {
    FlunksWidget()
} timeline: {
    FlunksWidgetEntry(date: .now, data: .placeholder)
}

#Preview(as: .systemLarge) {
    FlunksWidget()
} timeline: {
    FlunksWidgetEntry(date: .now, data: .placeholder)
}
