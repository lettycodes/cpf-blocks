import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectFunctionsEmulator } from 'firebase/functions';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions
  ) {
    if (environment.useEmulators) {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(firestore, 'localhost', 8083);
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
  }
}
