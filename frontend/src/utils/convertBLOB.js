public function getImageUrl(): ?string
{
    $photo = $this->getPhoto();
    if ($photo) {
        return 'data:image/jpeg;base64,' . $photo;
    }
    return null;
}