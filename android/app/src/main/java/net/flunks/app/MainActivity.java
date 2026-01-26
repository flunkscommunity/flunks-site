package net.flunks.app;

import android.os.Bundle;
import android.content.Intent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register custom plugins before super.onCreate
        registerPlugin(FlunksWidgetBridge.class);
        
        super.onCreate(savedInstanceState);
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // Handle the intent when app is already running (resumed from background)
        // This ensures deep links work properly when returning from Flow Wallet
        setIntent(intent);
    }
}
