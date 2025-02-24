import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart' hide EmailAuthProvider;
import 'package:firebase_ui_auth/firebase_ui_auth.dart';
import 'package:firebase_ui_oauth_google/firebase_ui_oauth_google.dart';
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

import 'save_helper.dart' if (dart.library.js_interop) 'save_helper_web.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const MaterialApp(
    debugShowCheckedModeBanner: false,
    home: HomePage(),
  ));
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  PdfViewerController _pdfViewerController = PdfViewerController();
  final UndoHistoryController _undoRedoController = UndoHistoryController();
  late List<int> exportFormBytes;

  @override
  void initState() {
    _pdfViewerController = PdfViewerController();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: <Widget>[
            ListTile(
              title: const Text('Perfil'),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => Scaffold(
                      appBar: AppBar(
                        title: const Text('Perfil'),
                        leading: IconButton(
                          icon: const Icon(Icons.arrow_back),
                          onPressed: () {
                            Navigator.pop(context);
                          },
                        ),
                      ),
                      body: const Perfil(),
                    ),
                  ),
                );
              },
            ),
            const Divider(),
            ListTile(
              title: const Text('Salvar dados em nuvem'),
              onTap: () async {
                exportFormBytes = _pdfViewerController.exportFormData(
                  dataFormat: DataFormat.xfdf,
                );
                User? user = FirebaseAuth.instance.currentUser;
                if (user != null) {
                  await FirebaseFirestore.instance
                      .collection('pdfForms')
                      .doc(user.uid)
                      .set({'formData': exportFormBytes});
                }
              },
            ),
            ListTile(
              title: const Text('Carregar dados da nuvem'),
              onTap: () async {
                User? user = FirebaseAuth.instance.currentUser;
                if (user != null) {
                  DocumentSnapshot<Map<String, dynamic>> snapshot =
                      await FirebaseFirestore.instance
                          .collection('pdfForms')
                          .doc(user.uid)
                          .get();
                  if (snapshot.exists) {
                    List<int> formData =
                        List<int>.from(snapshot.data()!['formData']);
                    _pdfViewerController.importFormData(
                      formData,
                      DataFormat.xfdf,
                    );
                  }
                }
              },
            ),
          ],
        ),
      ),
      appBar: AppBar(
        title: const Text('DSFD'),
        actions: <Widget>[
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: <Widget>[
                ValueListenableBuilder(
                    valueListenable: _undoRedoController,
                    builder: (context, value, child) {
                      return IconButton(
                        onPressed: _undoRedoController.value.canUndo
                            ? _undoRedoController.undo
                            : null,
                        icon: const Icon(Icons.undo),
                        tooltip: 'Undo',
                      );
                    }),
                const SizedBox(width: 10),
                ValueListenableBuilder(
                    valueListenable: _undoRedoController,
                    builder: (context, value, child) {
                      return IconButton(
                        onPressed: _undoRedoController.value.canRedo
                            ? _undoRedoController.redo
                            : null,
                        icon: const Icon(Icons.redo),
                        tooltip: 'Redo',
                      );
                    }),
                const SizedBox(width: 10),
                IconButton(
                  icon: const Icon(
                    Icons.download,
                  ),
                  tooltip: 'Save Document',
                  onPressed: () async {
                    final List<int> savedBytes =
                        await _pdfViewerController.saveDocument();
                    SaveHelper.save(savedBytes, 'form_document.pdf');
                  },
                ),
              ],
            ),
          ),
        ],
      ),
      body: SfPdfViewer.asset(
        'assets/form_document.pdf',
        controller: _pdfViewerController,
        undoController: _undoRedoController,
      ),
    );
  }
}

class Perfil extends StatelessWidget {
  const Perfil({super.key});

  @override
  Widget build(BuildContext context) {
    return const AuthGate();
  }
}

const clientId =
    '414586401847-0hkrg41b7m09a65futmkn6tovkld0jmu.apps.googleusercontent.com';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.hasData) return const ProfileScreen();

        return SignInScreen(
          providers: [
            EmailAuthProvider(),
            GoogleProvider(clientId: clientId),
          ],
        );
      },
    );
  }
}
