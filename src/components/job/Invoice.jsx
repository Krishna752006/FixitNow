import { Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function Invoice({ invoice, jobId }) {
  if (!invoice) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500 text-center py-8">No invoice generated yet.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, you would generate a PDF and download it
    alert('Downloading invoice...');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 print:shadow-none print:border-0">
      <div className="flex justify-between items-start mb-8 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice #{invoice.number}</h2>
          <p className="text-gray-500">
            {invoice.date && format(new Date(invoice.date), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
          <p className="text-gray-900">
            {invoice.customerName || 'Customer Name'}
          </p>
          {invoice.customerAddress && (
            <p className="text-gray-500 text-sm mt-1">
              {invoice.customerAddress}
            </p>
          )}
        </div>
        <div className="text-right">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            invoice.status === 'paid' 
              ? 'bg-green-100 text-green-800' 
              : invoice.status === 'overdue'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
          </span>
          {invoice.dueDate && (
            <p className="text-gray-500 text-sm mt-2">
              Due: {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-4">SERVICE DETAILS</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items?.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    ${item.unitPrice?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    ${item.total?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right pr-6 py-2 text-sm font-medium text-gray-500">
                  Subtotal:
                </td>
                <td className="px-6 py-2 text-right text-sm text-gray-900">
                  ${invoice.subtotal?.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="text-right pr-6 py-2 text-sm font-medium text-gray-500">
                  Tax ({invoice.taxRate ? (invoice.taxRate * 100) : 18}%):
                </td>
                <td className="px-6 py-2 text-right text-sm text-gray-900">
                  ${invoice.tax?.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan="3" className="text-right pr-6 py-2 text-lg font-bold text-gray-900 border-t border-gray-200">
                  Total:
                </td>
                <td className="px-6 py-2 text-right text-lg font-bold text-gray-900 border-t border-gray-200">
                  ${invoice.total?.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">NOTES</h3>
          <p className="text-sm text-gray-500">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
