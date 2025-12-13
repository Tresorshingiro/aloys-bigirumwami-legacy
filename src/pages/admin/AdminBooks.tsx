import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Book {
  id: string;
  title: string;
  short_description: string;
  description: string;
  price: number;
  cover_image: string | null;
  year: number;
  pages: number | null;
  language: string | null;
  stock: number;
  created_at: string;
}

const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    price: 0,
    year: new Date().getFullYear(),
    pages: 0,
    language: '',
    stock: 0,
    cover_image: '',
  });

  const fetchBooks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
      setFilteredBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch books',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [searchQuery, books]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `book-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('book-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('book-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleAdd = async () => {
    try {
      setUploading(true);
      let coverImageUrl = formData.cover_image;

      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (!uploadedUrl) {
          setUploading(false);
          return;
        }
        coverImageUrl = uploadedUrl;
      }

      const { error } = await supabase.from('books').insert([{
        ...formData,
        cover_image: coverImageUrl,
      }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Book added successfully',
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: 'Error',
        description: 'Failed to add book',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingBook) return;

    try {
      setUploading(true);
      let coverImageUrl = formData.cover_image;

      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (!uploadedUrl) {
          setUploading(false);
          return;
        }
        coverImageUrl = uploadedUrl;

        // Delete old image if it exists
        if (editingBook.cover_image) {
          const oldPath = editingBook.cover_image.split('/book-images/')[1];
          if (oldPath) {
            await supabase.storage
              .from('book-images')
              .remove([`book-covers/${oldPath}`]);
          }
        }
      }

      const { error } = await supabase
        .from('books')
        .update({
          ...formData,
          cover_image: coverImageUrl,
        })
        .eq('id', editingBook.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Book updated successfully',
      });

      setEditingBook(null);
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error('Error updating book:', error);
      toast({
        title: 'Error',
        description: 'Failed to update book',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const book = books.find(b => b.id === bookId);
      
      // Delete the image from storage if it exists
      if (book?.cover_image) {
        const imagePath = book.cover_image.split('/book-images/')[1];
        if (imagePath) {
          await supabase.storage
            .from('book-images')
            .remove([`book-covers/${imagePath}`]);
        }
      }

      const { error } = await supabase.from('books').delete().eq('id', bookId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Book deleted successfully',
      });

      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete book',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      short_description: book.short_description,
      description: book.description,
      price: book.price,
      year: book.year,
      pages: book.pages || 0,
      language: book.language || '',
      stock: book.stock,
      cover_image: book.cover_image || '',
    });
    setPreviewUrl(book.cover_image || '');
    setSelectedFile(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      short_description: '',
      description: '',
      price: 0,
      year: new Date().getFullYear(),
      pages: 0,
      language: '',
      stock: 0,
      cover_image: '',
    });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const closeDialogs = () => {
    setIsAddDialogOpen(false);
    setEditingBook(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2">
            Book <span className="text-gold">Management</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your book inventory
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} variant="gold">
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              All Books ({filteredBooks.length})
            </span>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.year}</TableCell>
                    <TableCell>${book.price.toFixed(2)}</TableCell>
                    <TableCell>{book.stock}</TableCell>
                    <TableCell>{book.language}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(book)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(book.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No books found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Book Dialog */}
      <Dialog
        open={isAddDialogOpen || !!editingBook}
        onOpenChange={closeDialogs}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="short_description">Short Description *</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) =>
                  setFormData({ ...formData, short_description: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (RWF) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="1"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="pages">Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  value={formData.pages}
                  onChange={(e) =>
                    setFormData({ ...formData, pages: parseInt(e.target.value) })
                  }
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                placeholder="e.g., Kinyarwanda, French"
              />
            </div>

            <div>
              <Label htmlFor="cover_image">Cover Image</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    id="cover_image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {previewUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                        setFormData({ ...formData, cover_image: '' });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {previewUrl && (
                  <div className="relative w-40 h-56 border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={editingBook ? handleUpdate : handleAdd}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingBook ? 'Update' : 'Add'} Book
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBooks;
