import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, X } from 'lucide-react';

interface QRCodeShareProps {
  url: string;
  title?: string;
}

export function QRCodeShare({ url, title = 'Share Calendar' }: QRCodeShareProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleCopyLink() {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 transition-all"
      >
        <Share2 className="w-5 h-5" />
        <span className="font-semibold">Share</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-navy-900 rounded-xl p-6 max-w-md w-full border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={url} size={200} />
              </div>
              <div className="w-full">
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all"
              >
                Copy Link
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

