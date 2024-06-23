import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyDuQGRRfGVVjVBJRhRprhg3bG61pHevMvM",    
      authDomain: "dabubble-257.firebaseapp.com",    
      projectId: "dabubble-257",    
      storageBucket: "dabubble-257.appspot.com",    
      messagingSenderId: "1048437261939",    
      appId: "1:1048437261939:web:6545ca4790290b7b660c06"
    })),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ]
};
