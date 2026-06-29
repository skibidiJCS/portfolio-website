#import <AppKit/AppKit.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreImage/CoreImage.h>

static void SaveFrame(CVPixelBufferRef buffer, NSString *path) {
  CIImage *source = [CIImage imageWithCVPixelBuffer:buffer];
  CIContext *context = [CIContext contextWithOptions:nil];
  CGImageRef image = [context createCGImage:source fromRect:source.extent];
  if (!image) return;
  NSBitmapImageRep *bitmap = [[NSBitmapImageRep alloc] initWithCGImage:image];
  NSData *data = [bitmap representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
  [data writeToFile:path atomically:YES];
  CGImageRelease(image);
}

int main(void) {
  @autoreleasepool {
    NSString *input = @"/tmp/jiacai-reference.mov";
    NSString *output = @"/tmp/jiacai-reference-frames";
    [[NSFileManager defaultManager] createDirectoryAtPath:output withIntermediateDirectories:YES attributes:nil error:nil];
    AVURLAsset *asset = [AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:input] options:nil];
    AVAssetTrack *track = [[asset tracksWithMediaType:AVMediaTypeVideo] firstObject];
    NSError *error = nil;
    AVAssetReader *reader = [[AVAssetReader alloc] initWithAsset:asset error:&error];
    NSDictionary *settings = @{(id)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA)};
    AVAssetReaderTrackOutput *trackOutput = [[AVAssetReaderTrackOutput alloc] initWithTrack:track outputSettings:settings];
    trackOutput.alwaysCopiesSampleData = NO;
    [reader addOutput:trackOutput];
    if (![reader startReading]) {
      fprintf(stderr, "reader failed: %s\n", reader.error.localizedDescription.UTF8String);
      return 1;
    }
    double duration = CMTimeGetSeconds(asset.duration);
    double interval = MAX(0.12, duration / 48.0);
    double nextTime = 0;
    NSInteger frame = 0;
    CMSampleBufferRef sample = NULL;
    while ((sample = [trackOutput copyNextSampleBuffer])) {
      double time = CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sample));
      if (time + 0.001 >= nextTime) {
        NSString *path = [output stringByAppendingPathComponent:[NSString stringWithFormat:@"frame-%03ld.png", (long)frame]];
        SaveFrame(CMSampleBufferGetImageBuffer(sample), path);
        frame += 1;
        nextTime += interval;
      }
      CFRelease(sample);
    }
    printf("duration=%.2f frames=%ld status=%ld\n", duration, (long)frame, (long)reader.status);
    if (reader.error) fprintf(stderr, "reader error: %s\n", reader.error.localizedDescription.UTF8String);
  }
  return 0;
}
