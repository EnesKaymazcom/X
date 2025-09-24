# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ===== React Native Core =====
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip
-keep,allowobfuscation @interface com.facebook.jni.annotations.DoNotStrip

# Do not strip any method/class that is annotated with @DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *
-keep @com.facebook.jni.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
    @com.facebook.jni.annotations.DoNotStrip *;
}

-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * implements com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

-dontwarn com.facebook.react.**
-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }
-keep,includedescriptorclasses class com.facebook.react.turbomodule.** { *; }

# ===== Hermes =====
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# ===== SoLoader =====
-keep class com.facebook.soloader.** { *; }
-dontwarn com.facebook.soloader.**

# ===== Okhttp =====
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase
-dontwarn org.conscrypt.**
-dontwarn com.squareup.okhttp3.**
-keep class com.squareup.okhttp3.** { *; }

# ===== Okio =====
-keep class sun.misc.Unsafe { *; }
-dontwarn java.nio.file.*
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement

# ===== Websockets =====
-keep class com.facebook.react.modules.websocket.** { *; }

# ===== Animated =====
-keep class com.facebook.animated.** { *; }
-keep class com.facebook.react.animated.** { *; }

# ===== React Native Reanimated =====
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keepclassmembers class com.swmansion.reanimated.** { *; }

# ===== React Native Gesture Handler =====
-keep class com.swmansion.gesturehandler.** { *; }
-keepclassmembers class com.swmansion.gesturehandler.** { *; }

# ===== React Native Screens =====
-keep class com.swmansion.rnscreens.** { *; }

# ===== React Native SVG =====
-keep class com.horcrux.svg.** { *; }

# ===== React Native Maps/Mapbox =====
-keep class com.mapbox.** { *; }
-keep class com.rnmapbox.** { *; }
-dontwarn com.mapbox.**
-dontwarn com.rnmapbox.**

# ===== React Native Vector Icons =====
-keep class com.oblador.vectoricons.** { *; }

# ===== React Native Config =====
-keep class com.lugg.ReactNativeConfig.** { *; }

# ===== React Native Image Picker =====
-keep class com.imagepicker.** { *; }

# ===== React Native Permissions =====
-keep class com.zoontek.rnpermissions.** { *; }

# ===== React Native AsyncStorage =====
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ===== Supabase =====
-keep class io.supabase.** { *; }
-dontwarn io.supabase.**

# ===== AWS SDK =====
-keep class com.amazonaws.** { *; }
-dontwarn com.amazonaws.**

# ===== Axios =====
-keep class axios.** { *; }

# ===== JSC =====
-keep class org.webkit.** { *; }
-dontwarn org.webkit.**

# ===== Android Support Libraries =====
-keep class androidx.** { *; }
-dontwarn androidx.**

# ===== Crashlytics (if used) =====
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# ===== General Android Rules =====
-keepclassmembers class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator CREATOR;
}

-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ===== Keep JavaScript Interface =====
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ===== Preserve Annotations =====
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# ===== Optimize but don't remove =====
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# ===== Keep our app classes =====
-keep class com.fishivo.** { *; }
-keepclassmembers class com.fishivo.** { *; }

# ===== Remove Logging in Release =====
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
}

# ===== Keep BuildConfig =====
-keep class com.fishivo.BuildConfig { *; }

# ===== R8 Compatibility Mode =====
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ===== Keep essential classes =====
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.view.View

# ===== Keep Native Methods =====
-keepclasseswithmembernames class * {
    native <methods>;
}

# ===== Keep custom views =====
-keep public class * extends android.view.View {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# ===== Keep enums =====
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}