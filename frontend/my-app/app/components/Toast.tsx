export default function Toast({ message }: { message: string }) {
    return (
        <div className="toast-enter fixed bottom-6 right-6 z-50 rounded-lg border border-teal/30 bg-[#0d1826] px-5 py-3 text-sm font-medium text-teal shadow-lg shadow-teal/10">
            {message}
        </div>
    );
}
