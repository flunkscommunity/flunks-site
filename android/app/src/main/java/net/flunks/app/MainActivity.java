package net.flunks.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register custom plugins before super.onCreate
        registerPlugin(FlunksWidgetBridge.class);
        
        super.onCreate(savedInstanceState);
    }
}
