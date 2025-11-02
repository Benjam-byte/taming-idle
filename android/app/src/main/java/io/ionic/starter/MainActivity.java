package io.ionic.starter;


import android.os.Bundle;
import android.view.View;
import androidx.annotation.Nullable;
import com.getcapacitor.BridgeActivity;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

public class MainActivity extends BridgeActivity {

    private void hideSystemBarsSafe() {
        // 1) Edge-to-edge
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // 2) Récupère la root view et le controller de manière "safe"
        final View decor = getWindow() != null ? getWindow().getDecorView() : null;
        if (decor == null) return;

        WindowInsetsControllerCompat controller =
                ViewCompat.getWindowInsetsController(decor);

        if (controller == null) return;

        controller.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        );
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ⚠️ Ne pas appeler ici directement : certaines combinaisons crashent au cold start.
        // Poste la tâche sur la loop de la vue (s’assure que le decorView est prêt)
        final View decor = getWindow() != null ? getWindow().getDecorView() : null;
        if (decor != null) {
            decor.post(this::hideSystemBarsSafe);
        }
    }

    @Override
    protected void onPostResume() {
        super.onPostResume();
        // Appelé après que la fenêtre soit affichée -> safe
        hideSystemBarsSafe();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemBarsSafe(); // re-masque après overlays/clavier
        }
    }
}