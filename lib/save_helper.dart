import 'dart:io';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';

class SaveHelper {
  static Future<void> save(List<int> bytes, String fileName) async {
    Directory directory = await getTemporaryDirectory();

    final File file = File('${directory.path}/$fileName');
    if (file.existsSync()) {
      await file.delete();
    }
    await file.writeAsBytes(bytes);

    OpenFile.open(file.path);
  }
}
