#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(FlunksWidgetBridge, "FlunksWidgetBridge",
    CAP_PLUGIN_METHOD(updateWidgetData, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(refreshWidgets, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getWidgetData, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(clearWidgetData, CAPPluginReturnPromise);
)
