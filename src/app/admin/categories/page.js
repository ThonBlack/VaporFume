import { getCategories, createCategory, deleteCategory } from '@/app/actions/categories';
import CategoryManager from '@/components/CategoryManager';
import { FolderTree } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="mb-6 md:mb-10 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                    <FolderTree className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
                    <p className="text-gray-500 text-sm">Gerencie as categorias de produtos da loja.</p>
                </div>
            </div>

            <CategoryManager initialCategories={categories} />
        </div>
    );
}
